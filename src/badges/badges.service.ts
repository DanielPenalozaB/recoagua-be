import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Status } from 'src/common/enums/status.enum';
import { In, Not, Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination.dto';
import { applySearch, applySort, paginate } from '../common/utils/pagination.util';
import { BadgeFilterDto } from './dto/badge-filter.dto';
import { BadgeResponseDto } from './dto/badge-response.dto';
import { BulkCreateBadgeDto } from './dto/bulk-create-badge.dto';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { UpdateBadgeDto } from './dto/update-badge.dto';
import { Badge } from './entities/badge.entity';

@Injectable()
export class BadgesService {
  constructor(
    @InjectRepository(Badge)
    private readonly badgeRepository: Repository<Badge>,
  ) {}

  async create(createBadgeDto: CreateBadgeDto): Promise<BadgeResponseDto> {
    await this.validateNameUniqueness(createBadgeDto.name);

    const newBadge = this.badgeRepository.create({
      ...createBadgeDto,
      status: createBadgeDto.status || Status.ACTIVE,
    });

    const savedBadge = await this.badgeRepository.save(newBadge);
    return this.toResponseDto(savedBadge);
  }

  async bulkCreate(bulkCreateBadgeDto: BulkCreateBadgeDto): Promise<BadgeResponseDto[]> {
    const names = bulkCreateBadgeDto.badges.map(badge => badge.name);

    // Validate all names first
    const existingBadges = await this.badgeRepository.find({
      where: { name: In(names) }
    });

    if (existingBadges.length > 0) {
      throw new ConflictException(`Some badge names already exist: ${existingBadges.map(b => b.name).join(', ')}`);
    }

    // Create badges
    const badgesToCreate = bulkCreateBadgeDto.badges.map(badgeDto => 
      this.badgeRepository.create({
        ...badgeDto,
        status: badgeDto.status || Status.ACTIVE,
      })
    );

    try {
      const savedBadges = await this.badgeRepository.save(badgesToCreate);
      return savedBadges.map(badge => this.toResponseDto(badge));
    } catch {
      throw new InternalServerErrorException('Failed to create badges in bulk');
    }
  }

  async findAll(
    filterDto: BadgeFilterDto,
  ): Promise<PaginationDto<BadgeResponseDto>> {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'badge.updatedAt',
      sortDirection = 'DESC',
      status
    } = filterDto;

    const queryBuilder = this.badgeRepository
      .createQueryBuilder('badge');

    // Apply search
    applySearch(queryBuilder, search, [
      'badge.name',
      'badge.description',
      'badge.requirements'
    ]);

    // Apply filters
    if (status) {
      queryBuilder.andWhere('badge.status = :status', { status });
    }

    // Only return non-deleted badges
    queryBuilder.andWhere('badge.deletedAt IS NULL');

    // Apply sorting
    applySort(queryBuilder, sortBy, sortDirection);

    // Execute pagination
    const result = await paginate<Badge>(queryBuilder, page, limit);

    // Convert to DTO
    const data = result.data.map(badge => this.toResponseDto(badge));

    return {
      data,
      meta: result.meta
    };
  }

  async findOne(id: number): Promise<BadgeResponseDto> {
    const badge = await this.badgeRepository.findOne({
      where: { id },
      relations: ['userBadges'],
    });

    if (!badge || badge.deletedAt) {
      throw new NotFoundException('Badge not found');
    }

    return this.toResponseDto(badge);
  }

  async update(id: number, updateBadgeDto: UpdateBadgeDto): Promise<BadgeResponseDto> {
    const badge = await this.badgeRepository.findOne({
      where: { id },
    });

    if (!badge || badge.deletedAt) {
      throw new NotFoundException('Badge not found');
    }

    if (updateBadgeDto.name && updateBadgeDto.name !== badge.name) {
      await this.validateNameUniqueness(updateBadgeDto.name, id);
    }

    Object.assign(badge, updateBadgeDto);
    const updatedBadge = await this.badgeRepository.save(badge);
    return this.toResponseDto(updatedBadge);
  }

  async remove(id: number): Promise<void> {
    const badge = await this.badgeRepository.findOne({
      where: { id }
    });

    if (!badge || badge.deletedAt) {
      throw new NotFoundException('Badge not found');
    }

    badge.deletedAt = new Date();
    await this.badgeRepository.save(badge);
  }

  async findByStatus(status: Status): Promise<BadgeResponseDto[]> {
    const badges = await this.badgeRepository.find({
      where: { status, deletedAt: undefined },
      order: { name: 'ASC' },
    });

    return badges.map(badge => this.toResponseDto(badge));
  }

  async findActiveBadges(): Promise<BadgeResponseDto[]> {
    return this.findByStatus(Status.ACTIVE);
  }

  async updateStatus(id: number, status: Status): Promise<BadgeResponseDto> {
    const badge = await this.badgeRepository.findOne({
      where: { id },
    });

    if (!badge || badge.deletedAt) {
      throw new NotFoundException('Badge not found');
    }

    badge.status = status;
    const updatedBadge = await this.badgeRepository.save(badge);
    return this.toResponseDto(updatedBadge);
  }

  async activateBadge(id: number): Promise<BadgeResponseDto> {
    return this.updateStatus(id, Status.ACTIVE);
  }

  async deactivateBadge(id: number): Promise<BadgeResponseDto> {
    return this.updateStatus(id, Status.INACTIVE);
  }

  async getUserBadgeCount(badgeId: number): Promise<number> {
    const badge = await this.badgeRepository.findOne({
      where: { id: badgeId },
      relations: ['userBadges'],
    });

    if (!badge || badge.deletedAt) {
      throw new NotFoundException('Badge not found');
    }

    return badge.userBadges ? badge.userBadges.length : 0;
  }

  private async validateNameUniqueness(name: string, excludeBadgeId?: number): Promise<void> {
    const where: any = { name };
    if (excludeBadgeId) {
      where.id = Not(excludeBadgeId);
    }

    const existingBadge = await this.badgeRepository.findOne({ where });

    if (existingBadge) {
      throw new ConflictException('Badge name already exists');
    }
  }

  private toResponseDto(badge: Badge): BadgeResponseDto {
    return {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      imageUrl: badge.imageUrl,
      requirements: badge.requirements,
      status: badge.status,
      createdAt: badge.createdAt,
      updatedAt: badge.updatedAt,
      deletedAt: badge.deletedAt,
    };
  }
}