import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guide } from './entities/guide.entity';
import { CreateGuideDto } from './dto/create-guide.dto';
import { UpdateGuideDto } from './dto/update-guide.dto';
import { UserProgress } from '../user-progress/entities/user-progress.entity';
import { GuideFilterDto } from './dto/guide-filter.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CityResponseDto } from 'src/cities/dto/city-response.dto';
import { applySearch, applySort, paginate } from 'src/common/utils/pagination.util';
import { GuideResponseDto } from './dto/guide-response.dto';
import { GuideStatus } from './enums/guide-status.enum';
import { Module } from 'src/modules/entities/module.entity';
import { Block } from 'src/blocks/entities/block.entity';
import { BlockAnswer } from 'src/blocks/entities/block-answer.entity';
import { RelationalPair } from 'src/blocks/entities/relational-pair.entity';

@Injectable()
export class GuidesService {
  constructor(
    @InjectRepository(Guide)
    private readonly guideRepository: Repository<Guide>,
    @InjectRepository(Module)
    private readonly moduleRepository: Repository<Module>,
    @InjectRepository(Block)
    private readonly blockRepository: Repository<Block>,
    @InjectRepository(BlockAnswer)
    private readonly answerRepository: Repository<BlockAnswer>,
    @InjectRepository(RelationalPair)
    private readonly relationalPairRepository: Repository<RelationalPair>,
    @InjectRepository(UserProgress)
    private readonly userProgressRepository: Repository<UserProgress>,
  ) {}

  async create(createGuideDto: CreateGuideDto): Promise<Guide | null> {
    const { modules, ...guideData } = createGuideDto;

    const guide = this.guideRepository.create(guideData);
    const savedGuide = await this.guideRepository.save(guide);

    console.log('[GuidesService Create]:: Saved guide:', savedGuide);

    if (modules && modules.length > 0) {
      for (const moduleData of modules) {
        console.log('[GuidesService Create]:: moduleData:', moduleData);

        const { blocks, ...moduleInfo } = moduleData;

        // Create module
        const module = this.moduleRepository.create({
          ...moduleInfo,
          guide: savedGuide,
        });
        const savedModule = await this.moduleRepository.save(module);

        // Create blocks and their nested entities if they exist
        if (blocks && blocks.length > 0) {
          for (const blockData of blocks) {
            const { answers, relationalPairs, ...blockInfo } = blockData;

            // Create block
            const block = this.blockRepository.create({
              ...blockInfo,
              module: savedModule,
            });
            const savedBlock = await this.blockRepository.save(block);

            // Create answers if they exist
            if (answers && answers.length > 0) {
              const answerEntities = answers.map(answerData =>
                this.answerRepository.create({
                  ...answerData,
                  block: savedBlock,
                })
              );
              await this.answerRepository.save(answerEntities);
            }

            // Create relational pairs if they exist
            if (relationalPairs && relationalPairs.length > 0) {
              const pairEntities = relationalPairs.map(pairData =>
                this.relationalPairRepository.create({
                  ...pairData,
                  block: savedBlock,
                })
              );
              await this.relationalPairRepository.save(pairEntities);
            }
          }
        }
      }
    }

    // Return the complete guide with all relations
    return this.guideRepository.findOne({
      where: { id: savedGuide.id },
      relations: ['modules', 'modules.blocks', 'modules.blocks.answers', 'modules.blocks.relationalPairs'],
    });
  }


  async findAll(
    filterDto: GuideFilterDto
  ): Promise<PaginationDto<CityResponseDto>> {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'guide.updatedAt',
      sortDirection = 'DESC',
      status
    } = filterDto;

    const queryBuilder = this.guideRepository
      .createQueryBuilder('guide');

    // Apply search - now safely passing string (empty string if undefined)
    applySearch(queryBuilder, search, [
      'guide.name'
    ]);

    // Apply sorting - now safely passing strings
    applySort(queryBuilder, sortBy, sortDirection);

    // Apply status filter if provided
    if (status) {
      queryBuilder.andWhere('guide.status = :status', { status });
    }

    // Execute pagination
    const result = await paginate<Guide>(queryBuilder, page, limit);

    // Convert to DTO
    const data = result.data.map((guide) => this.toResponseDto(guide));

    return {
      data,
      meta: result.meta
    };
  }

  async findOne(id: number, includeModules = true): Promise<Guide> {
    const queryBuilder = this.guideRepository
      .createQueryBuilder('guide')
      .where('guide.id = :id', { id });

    if (includeModules) {
      queryBuilder
        .leftJoinAndSelect('guide.modules', 'modules')
        .leftJoinAndSelect('modules.blocks', 'blocks')
        .orderBy('modules.order', 'ASC')
        .addOrderBy('blocks.order', 'ASC');
    }

    const guide = await queryBuilder.getOne();

    if (!guide) {
      throw new NotFoundException(`Guide with ID ${id} not found`);
    }

    return guide;
  }

  async update(id: number, updateGuideDto: UpdateGuideDto): Promise<Guide> {
    const guide = await this.findOne(id, false);
    Object.assign(guide, updateGuideDto);
    return await this.guideRepository.save(guide);
  }

  async remove(id: number): Promise<void> {
    const guide = await this.findOne(id, false);
    await this.guideRepository.softDelete(id);
  }

  async publish(id: number): Promise<Guide> {
    const guide = await this.findOne(id);

    if (guide.modules.length === 0) {
      throw new BadRequestException('Cannot publish guide without modules');
    }

    guide.status = GuideStatus.PUBLISHED;
    return await this.guideRepository.save(guide);
  }

  async getUserProgress(guideId: number, userId: number) {
    return await this.userProgressRepository
      .createQueryBuilder('progress')
      .leftJoinAndSelect('progress.module', 'module')
      .where('progress.guide.id = :guideId', { guideId })
      .andWhere('progress.user.id = :userId', { userId })
      .orderBy('module.order', 'ASC')
      .getMany();
  }

  async getGuideStats(id: number) {
    const guide = await this.findOne(id);

    const totalUsers = await this.userProgressRepository
      .createQueryBuilder('progress')
      .where('progress.guide.id = :id', { id })
      .distinctOn(['progress.user'])
      .getCount();

    const completedUsers = await this.userProgressRepository
      .createQueryBuilder('progress')
      .where('progress.guide.id = :id', { id })
      .andWhere('progress.completionStatus = :status', { status: 'completed' })
      .distinctOn(['progress.user'])
      .getCount();

    return {
      guide,
      totalUsers,
      completedUsers,
      completionRate: totalUsers > 0 ? (completedUsers / totalUsers) * 100 : 0,
    };
  }

  private toResponseDto(guide: Guide): GuideResponseDto {
    return {
      id: guide.id,
      name: guide.name,
      description: guide.description,
      difficulty: guide.difficulty,
      estimatedDuration: guide.estimatedDuration,
      status: guide.status,
      language: guide.language,
      totalPoints: guide.totalPoints,
      createdAt: guide.createdAt,
      updatedAt: guide.updatedAt,
    };
  }
}