import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Patch,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ZonesService } from './zone.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { ZoneResponseDto } from './dto/zone-response.dto';
import { ZoneFilterDto } from './dto/zone-filter.dto';
import { BulkCreateZoneDto } from './dto/bulk-create-zone.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Zones')
@Controller('zones')
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new zone' })
  @ApiCreatedResponse({ type: ZoneResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Zone name already exists in this city' })
  async create(@Body() createZoneDto: CreateZoneDto): Promise<ZoneResponseDto> {
    return this.zonesService.create(createZoneDto);
  }

  @Post('bulk')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create multiple zones at once' })
  @ApiCreatedResponse({ type: [ZoneResponseDto] })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'One or more zone names already exist in their cities' })
  async bulkCreate(@Body() bulkCreateZoneDto: BulkCreateZoneDto): Promise<ZoneResponseDto[]> {
    return this.zonesService.bulkCreate(bulkCreateZoneDto);
  }

  @Get()
  @ApiOperation({ summary: 'List and filter zones with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of zones',
    type: PaginationDto<ZoneResponseDto>
  })
  findAll(
    @Query() filterDto: ZoneFilterDto,
  ): Promise<PaginationDto<ZoneResponseDto>> {
    return this.zonesService.findAll(filterDto);
  }

  @Get('city/:cityId')
  @ApiOperation({ summary: 'Get all zones for a specific city' })
  @ApiOkResponse({ type: [ZoneResponseDto] })
  async findByCity(@Param('cityId', ParseIntPipe) cityId: number): Promise<ZoneResponseDto[]> {
    return this.zonesService.findByCityId(cityId);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Find zones near a location' })
  @ApiOkResponse({ type: [ZoneResponseDto] })
  async findNearby(
    @Query('lat') latitude: number,
    @Query('lng') longitude: number,
    @Query('radius') radius: number = 10,
  ): Promise<ZoneResponseDto[]> {
    return this.zonesService.findNearby(latitude, longitude, radius);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get zone statistics' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        totalZones: { type: 'number' },
        zonesByStatus: { type: 'object' },
        zonesBySoilType: { type: 'object' },
        averageRainfall: { type: 'number' },
      }
    }
  })
  async getStatistics(): Promise<{
    totalZones: number;
    zonesByStatus: Record<string, number>;
    zonesBySoilType: Record<string, number>;
    averageRainfall: number;
  }> {
    return this.zonesService.getZoneStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a zone by ID' })
  @ApiOkResponse({ type: ZoneResponseDto })
  @ApiResponse({ status: 404, description: 'Zone not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ZoneResponseDto> {
    return this.zonesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a zone' })
  @ApiOkResponse({ type: ZoneResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Zone not found' })
  @ApiResponse({ status: 409, description: 'Zone name already exists in this city' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateZoneDto: UpdateZoneDto,
  ): Promise<ZoneResponseDto> {
    return this.zonesService.update(id, updateZoneDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a zone (soft delete)' })
  @ApiResponse({ status: 204, description: 'Zone deleted' })
  @ApiResponse({ status: 404, description: 'Zone not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.zonesService.remove(id);
  }
}