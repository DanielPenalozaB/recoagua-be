import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  BadRequestException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { Zone } from './entities/zone.entity';
import { City } from '../cities/entities/city.entity';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { ZoneResponseDto } from './dto/zone-response.dto';
import { ZoneFilterDto } from './dto/zone-filter.dto';
import { BulkCreateZoneDto } from './dto/bulk-create-zone.dto';
import { applySearch, applySort, paginate } from '../common/utils/pagination.util';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ZonesService {
  constructor(
    @InjectRepository(Zone)
    private readonly zoneRepository: Repository<Zone>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  async create(createZoneDto: CreateZoneDto): Promise<ZoneResponseDto> {
    await this.validateNameUniqueness(createZoneDto.name, createZoneDto.cityId);
    
    const city = await this.validateCity(createZoneDto.cityId);

    const newZone = this.zoneRepository.create({
      ...createZoneDto,
      city,
    });

    const savedZone = await this.zoneRepository.save(newZone);
    return this.toResponseDto(savedZone);
  }

  async bulkCreate(bulkCreateZoneDto: BulkCreateZoneDto): Promise<ZoneResponseDto[]> {
    // Validate all cities first
    const cityIds = [...new Set(bulkCreateZoneDto.zones.map(zone => zone.cityId))];
    const cities = await this.cityRepository.find({
      where: { id: In(cityIds) }
    });

    if (cities.length !== cityIds.length) {
      const missingCityIds = cityIds.filter(id => !cities.some(c => c.id === id));
      throw new BadRequestException(`Invalid city IDs: ${missingCityIds.join(', ')}`);
    }

    const cityMap = new Map(cities.map(city => [city.id, city]));

    // Validate name uniqueness within same cities
    const nameCityPairs = bulkCreateZoneDto.zones.map(zone => `${zone.name}-${zone.cityId}`);
    const existingZones = await this.zoneRepository
      .createQueryBuilder('zone')
      .where('zone.name IN (:...names)', { names: bulkCreateZoneDto.zones.map(z => z.name) })
      .andWhere('zone.cityId IN (:...cityIds)', { cityIds })
      .andWhere('zone.deletedAt IS NULL')
      .getMany();

    if (existingZones.length > 0) {
      const conflicts = existingZones.map(z => `${z.name} in city ${z.city.id}`);
      throw new ConflictException(`Some zone names already exist in their cities: ${conflicts.join(', ')}`);
    }

    // Create zones
    const zonesToCreate = bulkCreateZoneDto.zones.map(zoneDto =>
      this.zoneRepository.create({
        ...zoneDto,
        city: cityMap.get(zoneDto.cityId),
      })
    );

    try {
      const savedZones = await this.zoneRepository.save(zonesToCreate);
      return savedZones.map(zone => this.toResponseDto(zone));
    } catch {
      throw new InternalServerErrorException('Failed to create zones in bulk');
    }
  }

  async findAll(
    filterDto: ZoneFilterDto,
  ): Promise<PaginationDto<ZoneResponseDto>> {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'zone.updatedAt',
      sortDirection = 'DESC',
      cityId,
      status,
      soilType,
      minRainfall,
      maxRainfall,
      minAltitude,
      maxAltitude
    } = filterDto;

    const queryBuilder = this.zoneRepository
      .createQueryBuilder('zone')
      .leftJoinAndSelect('zone.city', 'city');

    // Apply search
    applySearch(queryBuilder, search, [
      'zone.name',
      'zone.description',
      'zone.recommendations'
    ]);

    // Apply filters
    if (cityId) {
      queryBuilder.andWhere('zone.cityId = :cityId', { cityId });
    }

    if (status) {
      queryBuilder.andWhere('zone.status = :status', { status });
    }

    if (soilType) {
      queryBuilder.andWhere('zone.soilType = :soilType', { soilType });
    }

    if (minRainfall !== undefined) {
      queryBuilder.andWhere('zone.rainfall >= :minRainfall', { minRainfall });
    }

    if (maxRainfall !== undefined) {
      queryBuilder.andWhere('zone.rainfall <= :maxRainfall', { maxRainfall });
    }

    if (minAltitude !== undefined) {
      queryBuilder.andWhere('zone.altitude >= :minAltitude', { minAltitude });
    }

    if (maxAltitude !== undefined) {
      queryBuilder.andWhere('zone.altitude <= :maxAltitude', { maxAltitude });
    }

    // Only return non-deleted zones
    queryBuilder.andWhere('zone.deletedAt IS NULL');

    // Apply sorting
    applySort(queryBuilder, sortBy, sortDirection);

    // Execute pagination
    const result = await paginate<Zone>(queryBuilder, page, limit);

    // Convert to DTO
    const data = result.data.map(zone => this.toResponseDto(zone));

    return {
      data,
      meta: result.meta
    };
  }

  async findOne(id: number): Promise<ZoneResponseDto> {
    const zone = await this.zoneRepository.findOne({
      where: { id },
      relations: ['city'],
    });

    if (!zone || zone.deletedAt) {
      throw new NotFoundException('Zone not found');
    }

    return this.toResponseDto(zone);
  }

  async update(id: number, updateZoneDto: UpdateZoneDto): Promise<ZoneResponseDto> {
    const zone = await this.zoneRepository.findOne({
      where: { id },
      relations: ['city'],
    });

    if (!zone || zone.deletedAt) {
      throw new NotFoundException('Zone not found');
    }

    if (updateZoneDto.name && updateZoneDto.name !== zone.name) {
      const cityId = updateZoneDto.cityId || zone.city.id;
      await this.validateNameUniqueness(updateZoneDto.name, cityId, id);
    }

    if (updateZoneDto.cityId) {
      zone.city = await this.validateCity(updateZoneDto.cityId);
    }

    Object.assign(zone, updateZoneDto);
    const updatedZone = await this.zoneRepository.save(zone);
    return this.toResponseDto(updatedZone);
  }

  async remove(id: number): Promise<void> {
    const zone = await this.zoneRepository.findOne({
      where: { id }
    });

    if (!zone || zone.deletedAt) {
      throw new NotFoundException('Zone not found');
    }

    zone.deletedAt = new Date();
    await this.zoneRepository.save(zone);
  }

  async findByCityId(cityId: number): Promise<ZoneResponseDto[]> {
    const zones = await this.zoneRepository.find({
      where: {
        city: { id: cityId },
        deletedAt: undefined
      },
      relations: ['city'],
      order: { name: 'ASC' },
    });

    return zones.map(zone => this.toResponseDto(zone));
  }

  async findByStatus(status: string): Promise<ZoneResponseDto[]> {
    const zones = await this.zoneRepository.find({
      where: { status, deletedAt: undefined },
      relations: ['city'],
      order: { name: 'ASC' },
    });

    return zones.map(zone => this.toResponseDto(zone));
  }

  async findNearby(latitude: number, longitude: number, radiusKm: number = 10): Promise<ZoneResponseDto[]> {
    // Haversine formula to find zones within radius
    const zones = await this.zoneRepository
      .createQueryBuilder('zone')
      .leftJoinAndSelect('zone.city', 'city')
      .where('zone.deletedAt IS NULL')
      .andWhere(`
        (6371 * acos(cos(radians(:latitude)) * cos(radians(zone.latitude)) * 
        cos(radians(zone.longitude) - radians(:longitude)) + 
        sin(radians(:latitude)) * sin(radians(zone.latitude)))) <= :radius
      `, { latitude, longitude, radius: radiusKm })
      .orderBy('zone.name', 'ASC')
      .getMany();

    return zones.map(zone => this.toResponseDto(zone));
  }

  async getZoneStatistics(): Promise<{
    totalZones: number;
    zonesByStatus: Record<string, number>;
    zonesBySoilType: Record<string, number>;
    averageRainfall: number;
  }> {
    const totalZones = await this.zoneRepository.count({
      where: { deletedAt: undefined }
    });

    const statusStats = await this.zoneRepository
      .createQueryBuilder('zone')
      .select('zone.status, COUNT(zone.id) as count')
      .where('zone.deletedAt IS NULL')
      .groupBy('zone.status')
      .getRawMany();

    const soilTypeStats = await this.zoneRepository
      .createQueryBuilder('zone')
      .select('zone.soilType, COUNT(zone.id) as count')
      .where('zone.deletedAt IS NULL')
      .andWhere('zone.soilType IS NOT NULL')
      .groupBy('zone.soilType')
      .getRawMany();

    const avgRainfall = await this.zoneRepository
      .createQueryBuilder('zone')
      .select('AVG(zone.rainfall)', 'avg')
      .where('zone.deletedAt IS NULL')
      .andWhere('zone.rainfall IS NOT NULL')
      .getRawOne();

    return {
      totalZones,
      zonesByStatus: statusStats.reduce((acc, stat) => {
        acc[stat.zone_status] = parseInt(stat.count);
        return acc;
      }, {}),
      zonesBySoilType: soilTypeStats.reduce((acc, stat) => {
        acc[stat.zone_soilType] = parseInt(stat.count);
        return acc;
      }, {}),
      averageRainfall: parseFloat(avgRainfall?.avg) || 0,
    };
  }

  private async validateNameUniqueness(name: string, cityId: number, excludeZoneId?: number): Promise<void> {
    const where: any = { name, city: { id: cityId } };
    if (excludeZoneId) {
      where.id = Not(excludeZoneId);
    }

    const existingZone = await this.zoneRepository.findOne({
      where,
      relations: ['city']
    });

    if (existingZone) {
      throw new ConflictException('Zone name already exists in this city');
    }
  }

  private async validateCity(cityId: number): Promise<City> {
    const city = await this.cityRepository.findOne({
      where: { id: cityId }
    });
    if (!city) {
      throw new BadRequestException('Invalid city ID');
    }
    return city;
  }

  private toResponseDto(zone: Zone): ZoneResponseDto {
    return {
      id: zone.id,
      name: zone.name,
      description: zone.description,
      rainfall: zone.rainfall,
      latitude: zone.latitude,
      longitude: zone.longitude,
      recommendations: zone.recommendations,
      status: zone.status,
      altitude: zone.altitude,
      soilType: zone.soilType,
      avgTemperature: zone.avgTemperature,
      city: zone.city ? {
        id: zone.city.id,
        name: zone.city.name,
        description: zone.city.description,
        rainfall: zone.city.rainfall,
        language: zone.city.language,
      } : null,
      createdAt: zone.createdAt,
      updatedAt: zone.updatedAt,
      deletedAt: zone.deletedAt,
    };
  }
}