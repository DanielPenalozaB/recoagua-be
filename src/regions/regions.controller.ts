import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateRegionDto } from './dto/create-region.dto';
import { RegionFilterDto } from './dto/region-filter.dto';
import { RegionResponseDto } from './dto/region-response.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { RegionsService } from './regions.service';

@ApiTags('Regions')
@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiResponse({ status: 201, type: RegionResponseDto })
  async create(@Body() createRegionDto: CreateRegionDto): Promise<RegionResponseDto> {
    return this.regionsService.create(createRegionDto);
  }

  @Get()
  @ApiOperation({ summary: 'List and filter regions with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of regions',
    type: PaginationDto<RegionResponseDto>
  })
  async findAll(@Query() filterDto: RegionFilterDto): Promise<PaginationDto<RegionResponseDto>> {
    return this.regionsService.findAll(filterDto);
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: RegionResponseDto })
  @ApiResponse({ status: 404, description: 'Region not found' })
  async findOne(@Param('id') id: string): Promise<RegionResponseDto> {
    return this.regionsService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: RegionResponseDto })
  @ApiResponse({ status: 404, description: 'Region not found' })
  async update(
    @Param('id') id: string,
    @Body() updateRegionDto: UpdateRegionDto,
  ): Promise<RegionResponseDto> {
    return this.regionsService.update(+id, updateRegionDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Region not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.regionsService.remove(+id);
  }
}