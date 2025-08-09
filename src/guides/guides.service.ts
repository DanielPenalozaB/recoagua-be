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

@Injectable()
export class GuidesService {
  constructor(
    @InjectRepository(Guide)
    private readonly guideRepository: Repository<Guide>,
    @InjectRepository(UserProgress)
    private readonly userProgressRepository: Repository<UserProgress>,
  ) {}

  async create(createGuideDto: CreateGuideDto): Promise<Guide> {
    const guide = this.guideRepository.create(createGuideDto);
    return await this.guideRepository.save(guide);
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
    } = filterDto;

    const queryBuilder = this.guideRepository
      .createQueryBuilder('guide');

    // Apply search - now safely passing string (empty string if undefined)
    applySearch(queryBuilder, search, [
      'guide.name'
    ]);

    // Apply sorting - now safely passing strings
    applySort(queryBuilder, sortBy, sortDirection);

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