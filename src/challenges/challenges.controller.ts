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
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { ChallengeResponseDto } from './dto/challenge-response.dto';
import { ChallengeFilterDto } from './dto/challenge-filter.dto';
import { BulkCreateChallengeDto } from './dto/bulk-create-challenge.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Challenges')
@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new challenge' })
  @ApiCreatedResponse({ type: ChallengeResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Challenge name already exists' })
  async create(@Body() createChallengeDto: CreateChallengeDto): Promise<ChallengeResponseDto> {
    return this.challengesService.create(createChallengeDto);
  }

  @Post('bulk')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create multiple challenges at once' })
  @ApiCreatedResponse({ type: [ChallengeResponseDto] })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'One or more challenge names already exist' })
  async bulkCreate(@Body() bulkCreateChallengeDto: BulkCreateChallengeDto): Promise<ChallengeResponseDto[]> {
    return this.challengesService.bulkCreate(bulkCreateChallengeDto);
  }

  @Get()
  @ApiOperation({ summary: 'List and filter challenges with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of challenges',
    type: PaginationDto<ChallengeResponseDto>
  })
  findAll(
    @Query() filterDto: ChallengeFilterDto,
  ): Promise<PaginationDto<ChallengeResponseDto>> {
    return this.challengesService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a challenge by ID' })
  @ApiOkResponse({ type: ChallengeResponseDto })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ChallengeResponseDto> {
    return this.challengesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a challenge' })
  @ApiOkResponse({ type: ChallengeResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  @ApiResponse({ status: 409, description: 'Challenge name already exists' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateChallengeDto: UpdateChallengeDto,
  ): Promise<ChallengeResponseDto> {
    return this.challengesService.update(id, updateChallengeDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a challenge (soft delete)' })
  @ApiResponse({ status: 204, description: 'Challenge deleted' })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.challengesService.remove(id);
  }
}