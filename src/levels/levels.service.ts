import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Not, Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { applySearch, applySort, paginate } from '../common/utils/pagination.util';
import { BulkCreateLevelDto } from './dto/bulk-create-level.dto';
import { CreateLevelDto } from './dto/create-level.dto';
import { LevelFilterDto } from './dto/level-filter.dto';
import { LevelResponseDto } from './dto/level-response.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { Level } from './entities/level.entity';

@Injectable()
export class LevelsService {
  constructor(
    @InjectRepository(Level)
    private readonly levelRepository: Repository<Level>,
  ) {}

  async create(createLevelDto: CreateLevelDto): Promise<LevelResponseDto> {
    await this.validateNameUniqueness(createLevelDto.name);
    await this.validateRequiredPointsUniqueness(createLevelDto.requiredPoints);

    const newLevel = this.levelRepository.create(createLevelDto);
    const savedLevel = await this.levelRepository.save(newLevel);
    return this.toResponseDto(savedLevel);
  }

  async bulkCreate(bulkCreateLevelDto: BulkCreateLevelDto): Promise<LevelResponseDto[]> {
    const names = bulkCreateLevelDto.levels.map(level => level.name);
    const requiredPoints = bulkCreateLevelDto.levels.map(level => level.requiredPoints);
    
    // Validate all names first
    const existingLevelsByName = await this.levelRepository.find({
      where: { name: In(names) }
    });

    if (existingLevelsByName.length > 0) {
      throw new ConflictException(`Some level names already exist: ${existingLevelsByName.map(l => l.name).join(', ')}`);
    }

    // Validate all required points
    const existingLevelsByPoints = await this.levelRepository.find({
      where: { requiredPoints: In(requiredPoints) }
    });

    if (existingLevelsByPoints.length > 0) {
      throw new ConflictException(`Some required points values already exist: ${existingLevelsByPoints.map(l => l.requiredPoints).join(', ')}`);
    }

    // Create levels
    const levelsToCreate = bulkCreateLevelDto.levels.map(levelDto => 
      this.levelRepository.create(levelDto)
    );

    try {
      const savedLevels = await this.levelRepository.save(levelsToCreate);
      return savedLevels.map(level => this.toResponseDto(level));
    } catch {
      throw new InternalServerErrorException('Failed to create levels in bulk');
    }
  }

  async findAll(
    filterDto: LevelFilterDto,
  ): Promise<PaginationDto<LevelResponseDto>> {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'level.requiredPoints',
      sortDirection = 'ASC',
      minPoints,
      maxPoints
    } = filterDto;

    const queryBuilder = this.levelRepository
      .createQueryBuilder('level');

    // Apply search
    applySearch(queryBuilder, search, [
      'level.name',
      'level.description',
      'level.rewards'
    ]);

    // Apply filters
    if (minPoints !== undefined) {
      queryBuilder.andWhere('level.requiredPoints >= :minPoints', { minPoints });
    }

    if (maxPoints !== undefined) {
      queryBuilder.andWhere('level.requiredPoints <= :maxPoints', { maxPoints });
    }

    // Only return non-deleted levels
    queryBuilder.andWhere('level.deletedAt IS NULL');

    // Apply sorting - default sort by requiredPoints ASC
    applySort(queryBuilder, sortBy, sortDirection);

    // Execute pagination
    const result = await paginate<Level>(queryBuilder, page, limit);

    // Convert to DTO
    const data = result.data.map(level => this.toResponseDto(level));

    return {
      data,
      meta: result.meta
    };
  }

  async findOne(id: number): Promise<LevelResponseDto> {
    const level = await this.levelRepository.findOne({
      where: { id },
    });

    if (!level || level.deletedAt) {
      throw new NotFoundException('Level not found');
    }

    return this.toResponseDto(level);
  }

  async update(id: number, updateLevelDto: UpdateLevelDto): Promise<LevelResponseDto> {
    const level = await this.levelRepository.findOne({
      where: { id },
    });

    if (!level || level.deletedAt) {
      throw new NotFoundException('Level not found');
    }

    if (updateLevelDto.name && updateLevelDto.name !== level.name) {
      await this.validateNameUniqueness(updateLevelDto.name, id);
    }

    if (updateLevelDto.requiredPoints && updateLevelDto.requiredPoints !== level.requiredPoints) {
      await this.validateRequiredPointsUniqueness(updateLevelDto.requiredPoints, id);
    }

    Object.assign(level, updateLevelDto);
    const updatedLevel = await this.levelRepository.save(level);
    return this.toResponseDto(updatedLevel);
  }

  async remove(id: number): Promise<void> {
    const level = await this.levelRepository.findOne({
      where: { id }
    });

    if (!level || level.deletedAt) {
      throw new NotFoundException('Level not found');
    }

    level.deletedAt = new Date();
    await this.levelRepository.save(level);
  }

  async findByPointsRange(minPoints: number, maxPoints: number): Promise<LevelResponseDto[]> {
    const levels = await this.levelRepository.find({
      where: {
        requiredPoints: Between(minPoints, maxPoints),
        deletedAt: undefined,
      },
      order: { requiredPoints: 'ASC' },
    });

    return levels.map(level => this.toResponseDto(level));
  }

  async findLevelByPoints(points: number): Promise<LevelResponseDto | null> {
    const level = await this.levelRepository
      .createQueryBuilder('level')
      .where('level.requiredPoints <= :points', { points })
      .andWhere('level.deletedAt IS NULL')
      .orderBy('level.requiredPoints', 'DESC')
      .getOne();

    return level ? this.toResponseDto(level) : null;
  }

  async getNextLevel(currentLevelId: number): Promise<LevelResponseDto | null> {
    const currentLevel = await this.levelRepository.findOne({
      where: { id: currentLevelId },
    });

    if (!currentLevel) {
      throw new NotFoundException('Current level not found');
    }

    const nextLevel = await this.levelRepository
      .createQueryBuilder('level')
      .where('level.requiredPoints > :currentPoints', { currentPoints: currentLevel.requiredPoints })
      .andWhere('level.deletedAt IS NULL')
      .orderBy('level.requiredPoints', 'ASC')
      .getOne();

    return nextLevel ? this.toResponseDto(nextLevel) : null;
  }

  private async validateNameUniqueness(name: string, excludeLevelId?: number): Promise<void> {
    const where: any = { name };
    if (excludeLevelId) {
      where.id = Not(excludeLevelId);
    }

    const existingLevel = await this.levelRepository.findOne({ where });

    if (existingLevel) {
      throw new ConflictException('Level name already exists');
    }
  }

  private async validateRequiredPointsUniqueness(requiredPoints: number, excludeLevelId?: number): Promise<void> {
    const where: any = { requiredPoints };
    if (excludeLevelId) {
      where.id = Not(excludeLevelId);
    }

    const existingLevel = await this.levelRepository.findOne({ where });

    if (existingLevel) {
      throw new ConflictException('Level with these required points already exists');
    }
  }

  private toResponseDto(level: Level): LevelResponseDto {
    return {
      id: level.id,
      name: level.name,
      description: level.description,
      requiredPoints: level.requiredPoints,
      rewards: level.rewards,
      createdAt: level.createdAt,
      updatedAt: level.updatedAt,
      deletedAt: level.deletedAt,
    };
  }
}