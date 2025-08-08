import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from './entities/region.entity';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { RegionResponseDto } from './dto/region-response.dto';

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

  async findAll(): Promise<RegionResponseDto[]> {
    const regions = await this.regionRepository.find();
    return regions.map(region => this.toResponseDto(region));
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