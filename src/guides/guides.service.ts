import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Guide } from "./entities/guide.entity";
import { CreateGuideDto } from "./dto/create-guide.dto";
import { UpdateGuideDto } from "./dto/update-guide.dto";
import { UserProgress } from "../user-progress/entities/user-progress.entity";
import { GuideFilterDto } from "./dto/guide-filter.dto";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { CityResponseDto } from "src/cities/dto/city-response.dto";
import {
  applySearch,
  applySort,
  paginate,
} from "src/common/utils/pagination.util";
import { GuideResponseDto } from "./dto/guide-response.dto";
import { GuideStatus } from "./enums/guide-status.enum";
import { Module } from "src/modules/entities/module.entity";
import { Block } from "src/blocks/entities/block.entity";
import { BlockAnswer } from "src/blocks/entities/block-answer.entity";
import { RelationalPair } from "src/blocks/entities/relational-pair.entity";

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
    private readonly userProgressRepository: Repository<UserProgress>
  ) {}

  async create(createGuideDto: CreateGuideDto): Promise<Guide | null> {
    const { modules, ...guideData } = createGuideDto;

    const guide = this.guideRepository.create(guideData);
    const savedGuide = await this.guideRepository.save(guide);

    if (modules && modules.length > 0) {
      for (const moduleData of modules) {
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
              const answerEntities = answers.map((answerData) =>
                this.answerRepository.create({
                  ...answerData,
                  block: savedBlock,
                })
              );
              await this.answerRepository.save(answerEntities);
            }

            // Create relational pairs if they exist
            if (relationalPairs && relationalPairs.length > 0) {
              const pairEntities = relationalPairs.map((pairData) =>
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
      relations: [
        "modules",
        "modules.blocks",
        "modules.blocks.answers",
        "modules.blocks.relationalPairs",
      ],
    });
  }

  async findAll(
    filterDto: GuideFilterDto,
    userId?: number
  ): Promise<PaginationDto<any>> {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "guide.updatedAt",
      sortDirection = "DESC",
      status,
      hideCompleted = false,
    } = filterDto;

    const queryBuilder = this.guideRepository.createQueryBuilder("guide");

    // Join modules to count them
    queryBuilder.leftJoin("guide.modules", "module");

    if (userId) {
      // Subquery to count completed modules for this user
      queryBuilder.loadRelationCountAndMap(
        "guide.completedModulesCount",
        "guide.userProgress",
        "progress",
        (qb) =>
          qb.andWhere(
            "progress.userId = :userId AND progress.completionStatus = :status",
            {
              userId,
              status: "completed",
            }
          )
      );

      queryBuilder.loadRelationCountAndMap(
        "guide.totalModulesCount",
        "guide.modules"
      );
    }

    // Apply filters...
    applySearch(queryBuilder, search, ["guide.name"]);
    applySort(queryBuilder, sortBy, sortDirection);

    if (status) {
      queryBuilder.andWhere("guide.status = :status", { status });
    }

    const result = await paginate<Guide>(queryBuilder, page, limit);

    let data = result.data.map((guide) => {
      const dto = this.toResponseDto(guide);
      // Add a virtual field for completion
      const isCompleted = userId
        ? (guide as any).completedModulesCount > 0 &&
          (guide as any).completedModulesCount ===
            (guide as any).totalModulesCount
        : false;
      return { ...dto, isCompleted };
    });

    // Filter out completed if requested
    if (hideCompleted && userId) {
      data = data.filter((g) => !g.isCompleted);
    }

    return { data, meta: result.meta };
  }

  async findOne(id: number, includeModules = true): Promise<Guide> {
    const queryBuilder = this.guideRepository
      .createQueryBuilder("guide")
      .where("guide.id = :id", { id });

    if (includeModules) {
      queryBuilder
        .leftJoinAndSelect("guide.modules", "modules")
        .leftJoinAndSelect("modules.blocks", "blocks")
        .leftJoinAndSelect("blocks.answers", "answers")
        .leftJoinAndSelect("blocks.relationalPairs", "relationalPairs")
        .orderBy("modules.order", "ASC")
        .addOrderBy("blocks.order", "ASC")
        .addOrderBy("answers.order", "ASC");
    }

    const guide = await queryBuilder.getOne();

    if (!guide) {
      throw new NotFoundException(`Guide with ID ${id} not found`);
    }

    return guide;
  }

  async update(
    id: number,
    updateGuideDto: UpdateGuideDto
  ): Promise<Guide | null> {
    return await this.guideRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // First, get the guide with ALL relations properly loaded
        const guide = await transactionalEntityManager
          .createQueryBuilder(Guide, "guide")
          .leftJoinAndSelect("guide.modules", "modules")
          .leftJoinAndSelect("modules.blocks", "blocks")
          .leftJoinAndSelect("blocks.answers", "answers")
          .leftJoinAndSelect("blocks.relationalPairs", "relationalPairs")
          .where("guide.id = :id", { id })
          .getOne();

        if (!guide) {
          throw new NotFoundException(`Guide with ID ${id} not found`);
        }

        // Update guide properties (excluding modules)
        const { modules, ...guideData } = updateGuideDto;
        transactionalEntityManager.merge(Guide, guide, guideData);
        await transactionalEntityManager.save(guide);

        // Handle modules if provided
        if (modules) {
          // Remove existing modules and their nested entities using direct queries
          // This avoids the relation alias issues
          if (guide.modules && guide.modules.length > 0) {
            // Get all module IDs
            const moduleIds = guide.modules
              .map((module) => module.id)
              .filter((id) => id !== undefined);

            if (moduleIds.length > 0) {
              // Get all block IDs from these modules
              const blockIds = guide.modules.flatMap(
                (module) =>
                  module.blocks
                    ?.map((block) => block.id)
                    .filter((id) => id !== undefined) || []
              );

              // Delete in correct order to respect foreign key constraints
              if (blockIds.length > 0) {
                // Delete answers
                await transactionalEntityManager
                  .createQueryBuilder()
                  .delete()
                  .from(BlockAnswer)
                  .where("blockId IN (:...blockIds)", { blockIds })
                  .execute();

                // Delete relational pairs
                await transactionalEntityManager
                  .createQueryBuilder()
                  .delete()
                  .from(RelationalPair)
                  .where("blockId IN (:...blockIds)", { blockIds })
                  .execute();

                // Delete blocks
                await transactionalEntityManager
                  .createQueryBuilder()
                  .delete()
                  .from(Block)
                  .where("id IN (:...blockIds)", { blockIds })
                  .execute();
              }

              // Delete modules
              await transactionalEntityManager
                .createQueryBuilder()
                .delete()
                .from(Module)
                .where("id IN (:...moduleIds)", { moduleIds })
                .execute();
            }
          }

          // Create new modules
          for (const moduleData of modules) {
            const module = transactionalEntityManager.create(Module, {
              ...moduleData,
              guide: { id },
            });
            const savedModule = await transactionalEntityManager.save(module);

            // Create blocks
            if (moduleData.blocks) {
              for (const blockData of moduleData.blocks) {
                const block = transactionalEntityManager.create(Block, {
                  ...blockData,
                  module: savedModule,
                });
                const savedBlock = await transactionalEntityManager.save(block);

                // Create answers
                if (blockData.answers && blockData.answers.length > 0) {
                  const answers = blockData.answers.map((answerData) =>
                    transactionalEntityManager.create(BlockAnswer, {
                      ...answerData,
                      block: savedBlock,
                    })
                  );
                  await transactionalEntityManager.save(answers);
                }

                // Create relational pairs
                if (
                  blockData.relationalPairs &&
                  blockData.relationalPairs.length > 0
                ) {
                  const pairs = blockData.relationalPairs.map((pairData) =>
                    transactionalEntityManager.create(RelationalPair, {
                      ...pairData,
                      block: savedBlock,
                    })
                  );
                  await transactionalEntityManager.save(pairs);
                }
              }
            }
          }
        }

        // Return the updated guide with all relations
        return transactionalEntityManager
          .createQueryBuilder(Guide, "guide")
          .leftJoinAndSelect("guide.modules", "modules")
          .leftJoinAndSelect("modules.blocks", "blocks")
          .leftJoinAndSelect("blocks.answers", "answers")
          .leftJoinAndSelect("blocks.relationalPairs", "relationalPairs")
          .where("guide.id = :id", { id })
          .getOne();
      }
    );
  }

  async remove(id: number): Promise<void> {
    const guide = await this.findOne(id, false);
    await this.guideRepository.softDelete(id);
  }

  async publish(id: number): Promise<Guide> {
    const guide = await this.findOne(id);

    if (guide.modules.length === 0) {
      throw new BadRequestException("Cannot publish guide without modules");
    }

    guide.status = GuideStatus.PUBLISHED;
    return await this.guideRepository.save(guide);
  }

  async getUserProgress(guideId: number, userId: number) {
    return await this.userProgressRepository
      .createQueryBuilder("progress")
      .leftJoinAndSelect("progress.module", "module")
      .where("progress.guide.id = :guideId", { guideId })
      .andWhere("progress.user.id = :userId", { userId })
      .orderBy("module.order", "ASC")
      .getMany();
  }

  async getGuideStats(id: number) {
    const guide = await this.findOne(id);

    const totalUsers = await this.userProgressRepository
      .createQueryBuilder("progress")
      .where("progress.guide.id = :id", { id })
      .distinctOn(["progress.user"])
      .getCount();

    const completedUsers = await this.userProgressRepository
      .createQueryBuilder("progress")
      .where("progress.guide.id = :id", { id })
      .andWhere("progress.completionStatus = :status", { status: "completed" })
      .distinctOn(["progress.user"])
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
