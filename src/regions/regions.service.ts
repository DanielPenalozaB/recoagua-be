import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { applySearch, applySort, paginate } from 'src/common/utils/pagination.util';
import { Repository } from 'typeorm';
import { CreateRegionDto } from './dto/create-region.dto';
import { RegionFilterDto } from './dto/region-filter.dto';
import { RegionResponseDto } from './dto/region-response.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { Region } from './entities/region.entity';

@Injectable()
export class RegionsService {
  constructor(
    @InjectRepository(Region)
    private readonly regionRepository: Repository<Region>,
  ) {}

  async create(createRegionDto: CreateRegionDto): Promise<RegionResponseDto> {
    const region = this.regionRepository.create(createRegionDto);
    const savedRegion = await this.regionRepository.save(region);
    return this.toResponseDto(savedRegion);
  }

  async findAll(
    filterDto: RegionFilterDto
  ): Promise<PaginationDto<RegionResponseDto>> {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'region.updatedAt',
      sortDirection = 'DESC'
    } = filterDto;

    const queryBuilder = this.regionRepository
      .createQueryBuilder('region');

    // Apply search - now safely passing string (empty string if undefined)
    applySearch(queryBuilder, search, [
      'region.name'
    ]);

    // Apply sorting - now safely passing strings
    applySort(queryBuilder, sortBy, sortDirection);

    // Execute pagination
    const result = await paginate<Region>(queryBuilder, page, limit);

    // Convert to DTO
    const data = result.data.map((region) => this.toResponseDto(region));

    return {
      data,
      meta: result.meta
    };
  }

  async findOne(id: number): Promise<RegionResponseDto> {
    const region = await this.regionRepository.findOne({ where: { id } });

    if (!region) {
      throw new NotFoundException('Region not found');
    }

    return this.toResponseDto(region);
  }

  async update(id: number, updateRegionDto: UpdateRegionDto): Promise<RegionResponseDto> {
    const region = await this.regionRepository.findOne({ where: { id } });

    if (!region) {
      throw new NotFoundException('Region not found');
    }

    Object.assign(region, updateRegionDto);
    const updatedRegion = await this.regionRepository.save(region);
    return this.toResponseDto(updatedRegion);
  }

  async remove(id: number): Promise<void> {
    const region = await this.regionRepository.findOne({ where: { id } });
    if (!region) {
      throw new NotFoundException('Region not found');
    }
    await this.regionRepository.softDelete(id);
  }

  private toResponseDto(region: Region): RegionResponseDto {
    return {
      id: region.id,
      name: region.name,
      description: region.description,
      language: region.language,
      createdAt: region.createdAt,
      updatedAt: region.updatedAt,
    };
  }
}