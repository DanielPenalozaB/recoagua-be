import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProgress } from './entities/user-progress.entity';
import { User } from '../users/entities/user.entity';
import { Guide } from '../guides/entities/guide.entity';
import { Module } from '../modules/entities/module.entity';
import { CreateUserProgressDto } from './dto/create-user-progress.dto';
import { UpdateUserProgressDto } from './dto/update-user-progress.dto';
import { CompletionStatus } from './enums/completion-status.enum';

@Injectable()
export class UserProgressService {
  constructor(
    @InjectRepository(UserProgress)
    private readonly userProgressRepository: Repository<UserProgress>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Guide)
    private readonly guideRepository: Repository<Guide>,
    @InjectRepository(Module)
    private readonly moduleRepository: Repository<Module>,
  ) {}

  async create(createUserProgressDto: CreateUserProgressDto): Promise<UserProgress> {
    const user = await this.userRepository.findOne({
      where: { id: createUserProgressDto.userId }
    });
    const guide = await this.guideRepository.findOne({
      where: { id: createUserProgressDto.guideId }
    });
    const module = await this.moduleRepository.findOne({
      where: { id: createUserProgressDto.moduleId }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${createUserProgressDto.userId} not found`);
    }
    if (!guide) {
      throw new NotFoundException(`Guide with ID ${createUserProgressDto.guideId} not found`);
    }
    if (!module) {
      throw new NotFoundException(`Module with ID ${createUserProgressDto.moduleId} not found`);
    }

    // Check if progress already exists for this combination
    const existingProgress = await this.userProgressRepository.findOne({
      where: {
        user: { id: createUserProgressDto.userId },
        guide: { id: createUserProgressDto.guideId },
        module: { id: createUserProgressDto.moduleId },
      }
    });

    if (existingProgress) {
      throw new BadRequestException('Progress record already exists for this user, guide, and module');
    }

    const userProgress = this.userProgressRepository.create({
      ...createUserProgressDto,
      user,
      guide,
      module,
    });

    return await this.userProgressRepository.save(userProgress);
  }

  async findAll(userId?: number, guideId?: number): Promise<UserProgress[]> {
    const queryBuilder = this.userProgressRepository
      .createQueryBuilder('progress')
      .leftJoinAndSelect('progress.user', 'user')
      .leftJoinAndSelect('progress.guide', 'guide')
      .leftJoinAndSelect('progress.module', 'module')
      .orderBy('progress.createdAt', 'DESC');

    if (userId) {
      queryBuilder.andWhere('user.id = :userId', { userId });
    }

    if (guideId) {
      queryBuilder.andWhere('guide.id = :guideId', { guideId });
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: number): Promise<UserProgress> {
    const progress = await this.userProgressRepository
      .createQueryBuilder('progress')
      .leftJoinAndSelect('progress.user', 'user')
      .leftJoinAndSelect('progress.guide', 'guide')
      .leftJoinAndSelect('progress.module', 'module')
      .where('progress.id = :id', { id })
      .getOne();

    if (!progress) {
      throw new NotFoundException(`User progress with ID ${id} not found`);
    }

    return progress;
  }

  async findByUserAndModule(userId: number, moduleId: number): Promise<UserProgress | null> {
    return await this.userProgressRepository
      .createQueryBuilder('progress')
      .leftJoinAndSelect('progress.user', 'user')
      .leftJoinAndSelect('progress.guide', 'guide')
      .leftJoinAndSelect('progress.module', 'module')
      .where('user.id = :userId', { userId })
      .andWhere('module.id = :moduleId', { moduleId })
      .getOne();
  }

  async update(id: number, updateUserProgressDto: UpdateUserProgressDto): Promise<UserProgress> {
    const progress = await this.findOne(id);

    // Auto-set completedAt if status changes to completed
    if (updateUserProgressDto.completionStatus === CompletionStatus.COMPLETED && 
        progress.completionStatus !== CompletionStatus.COMPLETED) {
      updateUserProgressDto.completedAt = new Date();
    }

    Object.assign(progress, updateUserProgressDto);
    return await this.userProgressRepository.save(progress);
  }

  async markAsCompleted(userId: number, moduleId: number, earnedPoints: number): Promise<UserProgress> {
    let progress = await this.findByUserAndModule(userId, moduleId);

    if (!progress) {
      // Create new progress record if it doesn't exist
      const module = await this.moduleRepository.findOne({
        where: { id: moduleId },
        relations: ['guide']
      });

      if (!module) {
        throw new NotFoundException(`Module with ID ${moduleId} not found`);
      }

      const createDto: CreateUserProgressDto = {
        userId,
        guideId: module.guide.id,
        moduleId,
        completionStatus: CompletionStatus.COMPLETED,
        earnedPoints,
      };

      return await this.create(createDto);
    }

    // Update existing progress
    progress.completionStatus = CompletionStatus.COMPLETED;
    progress.earnedPoints = earnedPoints;
    progress.completedAt = new Date();

    return await this.userProgressRepository.save(progress);
  }

  async getUserStats(userId: number) {
    const totalProgress = await this.userProgressRepository.count({
      where: { user: { id: userId } }
    });

    const completedModules = await this.userProgressRepository.count({
      where: { 
        user: { id: userId },
        completionStatus: CompletionStatus.COMPLETED
      }
    });

    const totalPointsEarned = await this.userProgressRepository
      .createQueryBuilder('progress')
      .select('SUM(progress.earnedPoints)', 'total')
      .where('progress.user.id = :userId', { userId })
      .getRawOne();

    const completedGuides = await this.userProgressRepository
      .createQueryBuilder('progress')
      .select('progress.guide.id', 'guideId')
      .addSelect('COUNT(progress.id)', 'completedModules')
      .addSelect('guide.totalModules', 'totalModules')
      .leftJoin('progress.guide', 'guide')
      .leftJoin(
        subQuery => subQuery
          .select('COUNT(module.id)', 'totalModules')
          .addSelect('module.guide.id', 'guideId')
          .from(Module, 'module')
          .groupBy('module.guide.id'),
        'guideModules',
        'guideModules.guideId = guide.id'
      )
      .where('progress.user.id = :userId', { userId })
      .andWhere('progress.completionStatus = :status', { status: CompletionStatus.COMPLETED })
      .groupBy('progress.guide.id')
      .addGroupBy('guide.totalModules')
      .having('COUNT(progress.id) = guide.totalModules')
      .getCount();

    return {
      totalModulesStarted: totalProgress,
      completedModules,
      totalPointsEarned: totalPointsEarned?.total || 0,
      completedGuides,
      completionRate: totalProgress > 0 ? (completedModules / totalProgress) * 100 : 0,
    };
  }

  async getGuideProgress(userId: number, guideId: number) {
    const progress = await this.userProgressRepository
      .createQueryBuilder('progress')
      .leftJoinAndSelect('progress.module', 'module')
      .where('progress.user.id = :userId', { userId })
      .andWhere('progress.guide.id = :guideId', { guideId })
      .orderBy('module.order', 'ASC')
      .getMany();

    const guide = await this.guideRepository.findOne({
      where: { id: guideId },
      relations: ['modules']
    });

    if (!guide) {
      throw new NotFoundException(`Guide with ID ${guideId} not found`);
    }

    const totalModules = guide.modules.length;
    const completedModules = progress.filter(p => p.completionStatus === CompletionStatus.COMPLETED).length;
    const totalPointsEarned = progress.reduce((sum, p) => sum + p.earnedPoints, 0);

    return {
      guide,
      progress,
      stats: {
        totalModules,
        completedModules,
        totalPointsEarned,
        completionPercentage: totalModules > 0 ? (completedModules / totalModules) * 100 : 0,
      }
    };
  }

  async remove(id: number): Promise<void> {
    const progress = await this.findOne(id);
    await this.userProgressRepository.remove(progress);
  }
}