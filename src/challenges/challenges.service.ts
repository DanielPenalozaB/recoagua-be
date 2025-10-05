import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { applySearch, applySort, paginate } from '../common/utils/pagination.util';
import { BulkCreateChallengeDto } from './dto/bulk-create-challenge.dto';
import { ChallengeFilterDto } from './dto/challenge-filter.dto';
import { ChallengeResponseDto } from './dto/challenge-response.dto';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { Challenge } from './entities/challenge.entity';
import { ChallengeDifficulty } from './enums/challenge-difficult.enum';
import { ChallengeStatus } from './enums/challenge-status.enum';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectRepository(Challenge)
    private readonly challengeRepository: Repository<Challenge>,
  ) {}

  async create(createChallengeDto: CreateChallengeDto): Promise<ChallengeResponseDto> {
    await this.validateNameUniqueness(createChallengeDto.name);

    const newChallenge = this.challengeRepository.create({
      ...createChallengeDto,
      status: createChallengeDto.status || ChallengeStatus.DRAFT,
    });

    const savedChallenge = await this.challengeRepository.save(newChallenge);
    return this.toResponseDto(savedChallenge);
  }

  async bulkCreate(bulkCreateChallengeDto: BulkCreateChallengeDto): Promise<ChallengeResponseDto[]> {
    const names = bulkCreateChallengeDto.challenges.map(challenge => challenge.name);

    // Validate all names first
    const existingChallenges = await this.challengeRepository.find({
      where: { name: In(names) }
    });

    if (existingChallenges.length > 0) {
      throw new ConflictException(`Some challenge names already exist: ${existingChallenges.map(c => c.name).join(', ')}`);
    }

    // Create challenges
    const challengesToCreate = bulkCreateChallengeDto.challenges.map(challengeDto =>
      this.challengeRepository.create({
        ...challengeDto,
        status: challengeDto.status || ChallengeStatus.DRAFT,
      })
    );

    try {
      const savedChallenges = await this.challengeRepository.save(challengesToCreate);
      return savedChallenges.map(challenge => this.toResponseDto(challenge));
    } catch {
      throw new InternalServerErrorException('Failed to create challenges in bulk');
    }
  }

  async findAll(
    filterDto: ChallengeFilterDto,
  ): Promise<PaginationDto<ChallengeResponseDto>> {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'challenge.updatedAt',
      sortDirection = 'DESC',
      difficulty,
      status,
      challengeType,
      minScore,
      maxScore
    } = filterDto;

    const queryBuilder = this.challengeRepository
      .createQueryBuilder('challenge');

    // Apply search
    applySearch(queryBuilder, search, [
      'challenge.name',
      'challenge.description'
    ]);

    // Apply filters
    if (difficulty) {
      queryBuilder.andWhere('challenge.difficulty = :difficulty', { difficulty });
    }

    if (status) {
      queryBuilder.andWhere('challenge.status = :status', { status });
    }

    if (challengeType) {
      queryBuilder.andWhere('challenge.challengeType = :challengeType', { challengeType });
    }

    if (minScore !== undefined) {
      queryBuilder.andWhere('challenge.score >= :minScore', { minScore });
    }

    if (maxScore !== undefined) {
      queryBuilder.andWhere('challenge.score <= :maxScore', { maxScore });
    }

    // Only return non-deleted challenges
    queryBuilder.andWhere('challenge.deletedAt IS NULL');

    // Apply sorting
    applySort(queryBuilder, sortBy, sortDirection);

    // Execute pagination
    const result = await paginate<Challenge>(queryBuilder, page, limit);

    // Convert to DTO
    const data = result.data.map(challenge => this.toResponseDto(challenge));

    return {
      data,
      meta: result.meta
    };
  }

  async findOne(id: number): Promise<ChallengeResponseDto> {
    const challenge = await this.challengeRepository.findOne({
      where: { id },
    });

    if (!challenge || challenge.deletedAt) {
      throw new NotFoundException('Challenge not found');
    }

    return this.toResponseDto(challenge);
  }

  async update(id: number, updateChallengeDto: UpdateChallengeDto): Promise<ChallengeResponseDto> {
    const challenge = await this.challengeRepository.findOne({
      where: { id },
    });

    if (!challenge || challenge.deletedAt) {
      throw new NotFoundException('Challenge not found');
    }

    if (updateChallengeDto.name && updateChallengeDto.name !== challenge.name) {
      await this.validateNameUniqueness(updateChallengeDto.name, id);
    }

    Object.assign(challenge, updateChallengeDto);
    const updatedChallenge = await this.challengeRepository.save(challenge);
    return this.toResponseDto(updatedChallenge);
  }

  async remove(id: number): Promise<void> {
    const challenge = await this.challengeRepository.findOne({
      where: { id }
    });

    if (!challenge || challenge.deletedAt) {
      throw new NotFoundException('Challenge not found');
    }

    challenge.deletedAt = new Date();
    await this.challengeRepository.save(challenge);
  }

  async findByStatus(status: ChallengeStatus): Promise<ChallengeResponseDto[]> {
    const challenges = await this.challengeRepository.find({
      where: { status, deletedAt: undefined },
    });

    return challenges.map(challenge => this.toResponseDto(challenge));
  }

  async findByDifficulty(difficulty: ChallengeDifficulty): Promise<ChallengeResponseDto[]> {
    const challenges = await this.challengeRepository.find({
      where: { difficulty, deletedAt: undefined },
    });

    return challenges.map(challenge => this.toResponseDto(challenge));
  }

  private async validateNameUniqueness(name: string, excludeChallengeId?: number): Promise<void> {
    const where: any = { name };
    if (excludeChallengeId) {
      where.id = Not(excludeChallengeId);
    }

    const existingChallenge = await this.challengeRepository.findOne({ where });

    if (existingChallenge) {
      throw new ConflictException('Challenge name already exists');
    }
  }

  private toResponseDto(challenge: Challenge): ChallengeResponseDto {
    return {
      id: challenge.id,
      name: challenge.name,
      description: challenge.description,
      score: challenge.score,
      difficulty: challenge.difficulty,
      status: challenge.status,
      challengeType: challenge.challengeType,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
      deletedAt: challenge.deletedAt,
    };
  }
}