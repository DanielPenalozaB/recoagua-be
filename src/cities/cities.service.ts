import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { Region } from '../regions/entities/region.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { CityResponseDto } from './dto/city-response.dto';
import { applySearch, applySort, paginate } from 'src/common/utils/pagination.util';
import { CityFilterDto } from './dto/city-filter.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectRepository(Region)
    private readonly regionRepository: Repository<Region>,
  ) {}

  async create(createCityDto: CreateCityDto): Promise<CityResponseDto> {
    if (!createCityDto.regionId) {
      throw new NotFoundException('Region ID is required');
    }

    const region = await this.regionRepository.findOne({ where: { id: createCityDto.regionId } });

    if (!region) {
      throw new NotFoundException('Region not found');
    }

    const city = this.cityRepository.create({
      ...createCityDto,
      region,
    });

    const savedCity = await this.cityRepository.save(city);
    return this.toResponseDto(savedCity);
  }

  async findAll(
      filterDto: CityFilterDto
    ): Promise<PaginationDto<CityResponseDto>> {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'city.updatedAt',
      sortDirection = 'DESC',
      regionId,
    } = filterDto;

    const queryBuilder = this.cityRepository
      .createQueryBuilder('city')
      .leftJoinAndSelect('city.region', 'region');

    // Apply search - now safely passing string (empty string if undefined)
    applySearch(queryBuilder, search, [
      'city.name',
      'city.email'
    ]);

    // Apply filters
    if (regionId) {
      queryBuilder.andWhere('region.id = :regionId', { regionId });
    }

    // Apply sorting - now safely passing strings
    applySort(queryBuilder, sortBy, sortDirection);

    // Execute pagination
    const result = await paginate<City>(queryBuilder, page, limit);

    // Convert to DTO
    const data = result.data.map((city) => this.toResponseDto(city));

    return {
      data,
      meta: result.meta
    };
  }

  async findOne(id: number): Promise<CityResponseDto> {
    const city = await this.cityRepository.findOne({
      where: { id },
      relations: ['region'],
    });

    if (!city) {
      throw new NotFoundException('City not found');
    }

    return this.toResponseDto(city);
  }

  async update(id: number, updateCityDto: UpdateCityDto): Promise<CityResponseDto> {
    const city = await this.cityRepository.findOne({
      where: { id },
      relations: ['region'],
    });

    if (!city) {
      throw new NotFoundException('City not found');
    }

    if (updateCityDto.regionId) {
      const region = await this.regionRepository.findOne({
        where: { id: updateCityDto.regionId }
      });
      if (!region) {
        throw new NotFoundException('Region not found');
      }
      city.region = region;
    }

    Object.assign(city, updateCityDto);
    const updatedCity = await this.cityRepository.save(city);
    return this.toResponseDto(updatedCity);
  }

  async remove(id: number): Promise<void> {
    const city = await this.cityRepository.findOne({ where: { id } });
    if (!city) {
      throw new NotFoundException('City not found');
    }
    await this.cityRepository.softDelete(id);
  }

  private toResponseDto(city: City): CityResponseDto {
    return {
      id: city.id,
      name: city.name,
      description: city.description,
      rainfall: city.rainfall,
      language: city.language,
      regionId: city.region?.id,
      createdAt: city.createdAt,
      updatedAt: city.updatedAt,
    };
  }
}