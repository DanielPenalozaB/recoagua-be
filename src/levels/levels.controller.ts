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
import { LevelsService } from './levels.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { LevelResponseDto } from './dto/level-response.dto';
import { LevelFilterDto } from './dto/level-filter.dto';
import { BulkCreateLevelDto } from './dto/bulk-create-level.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Levels')
@Controller('levels')
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new level' })
  @ApiCreatedResponse({ type: LevelResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Level name or required points already exist' })
  async create(@Body() createLevelDto: CreateLevelDto): Promise<LevelResponseDto> {
    return this.levelsService.create(createLevelDto);
  }

  @Post('bulk')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create multiple levels at once' })
  @ApiCreatedResponse({ type: [LevelResponseDto] })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'One or more level names or required points already exist' })
  async bulkCreate(@Body() bulkCreateLevelDto: BulkCreateLevelDto): Promise<LevelResponseDto[]> {
    return this.levelsService.bulkCreate(bulkCreateLevelDto);
  }

  @Get()
  @ApiOperation({ summary: 'List and filter levels with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of levels',
    type: PaginationDto<LevelResponseDto>
  })
  findAll(
    @Query() filterDto: LevelFilterDto,
  ): Promise<PaginationDto<LevelResponseDto>> {
    return this.levelsService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a level by ID' })
  @ApiOkResponse({ type: LevelResponseDto })
  @ApiResponse({ status: 404, description: 'Level not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<LevelResponseDto> {
    return this.levelsService.findOne(id);
  }

  @Get('points/:points')
  @ApiOperation({ summary: 'Get level by user points' })
  @ApiOkResponse({ type: LevelResponseDto })
  @ApiResponse({ status: 404, description: 'No level found for the given points' })
  async findByPoints(@Param('points', ParseIntPipe) points: number): Promise<LevelResponseDto | null> {
    return this.levelsService.findLevelByPoints(points);
  }

  @Get(':id/next')
  @ApiOperation({ summary: 'Get the next level' })
  @ApiOkResponse({ type: LevelResponseDto })
  @ApiResponse({ status: 404, description: 'Current level not found or no next level' })
  async getNextLevel(@Param('id', ParseIntPipe) id: number): Promise<LevelResponseDto | null> {
    return this.levelsService.getNextLevel(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a level' })
  @ApiOkResponse({ type: LevelResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Level not found' })
  @ApiResponse({ status: 409, description: 'Level name or required points already exist' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLevelDto: UpdateLevelDto,
  ): Promise<LevelResponseDto> {
    return this.levelsService.update(id, updateLevelDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a level (soft delete)' })
  @ApiResponse({ status: 204, description: 'Level deleted' })
  @ApiResponse({ status: 404, description: 'Level not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.levelsService.remove(id);
  }
}