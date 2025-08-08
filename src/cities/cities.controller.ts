import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { CityResponseDto } from './dto/city-response.dto';
import { ApiBearerAuth, ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CityFilterDto } from './dto/city-filter.dto';

@ApiTags('Cities')
@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  @ApiBearerAuth()
  @ApiResponse({ status: 201, type: CityResponseDto })
  async create(@Body() createCityDto: CreateCityDto): Promise<CityResponseDto> {
    return this.citiesService.create(createCityDto);
  }

  @Get()
  @ApiOperation({ summary: 'List and filter cities with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of cities',
    type: PaginationDto<CityResponseDto>
  })
  async findAll(@Query() filterDto: CityFilterDto): Promise<PaginationDto<CityResponseDto>> {
    return this.citiesService.findAll(filterDto);
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: CityResponseDto })
  @ApiResponse({ status: 404, description: 'City not found' })
  async findOne(@Param('id') id: string): Promise<CityResponseDto> {
    return this.citiesService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, type: CityResponseDto })
  @ApiResponse({ status: 404, description: 'City not found' })
  async update(
    @Param('id') id: string,
    @Body() updateCityDto: UpdateCityDto,
  ): Promise<CityResponseDto> {
    return this.citiesService.update(+id, updateCityDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'City not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.citiesService.remove(+id);
  }
}