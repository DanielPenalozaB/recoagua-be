import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RegionsService } from './regions.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { RegionResponseDto } from './dto/region-response.dto';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';

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
  @ApiResponse({ status: 200, type: [RegionResponseDto] })
  async findAll(): Promise<RegionResponseDto[]> {
    return this.regionsService.findAll();
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