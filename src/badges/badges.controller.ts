import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Status } from 'src/common/enums/status.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserRole } from '../users/enums/user-role.enum';
import { BadgesService } from './badges.service';
import { BadgeFilterDto } from './dto/badge-filter.dto';
import { BadgeResponseDto } from './dto/badge-response.dto';
import { BulkCreateBadgeDto } from './dto/bulk-create-badge.dto';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { UpdateBadgeDto } from './dto/update-badge.dto';

@ApiTags('Badges')
@Controller('badges')
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new badge' })
  @ApiCreatedResponse({ type: BadgeResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Badge name already exists' })
  async create(@Body() createBadgeDto: CreateBadgeDto): Promise<BadgeResponseDto> {
    return this.badgesService.create(createBadgeDto);
  }

  @Post('bulk')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create multiple badges at once' })
  @ApiCreatedResponse({ type: [BadgeResponseDto] })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'One or more badge names already exist' })
  async bulkCreate(@Body() bulkCreateBadgeDto: BulkCreateBadgeDto): Promise<BadgeResponseDto[]> {
    return this.badgesService.bulkCreate(bulkCreateBadgeDto);
  }

  @Get()
  @ApiOperation({ summary: 'List and filter badges with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of badges',
    type: PaginationDto<BadgeResponseDto>
  })
  findAll(
    @Query() filterDto: BadgeFilterDto,
  ): Promise<PaginationDto<BadgeResponseDto>> {
    return this.badgesService.findAll(filterDto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active badges' })
  @ApiOkResponse({ type: [BadgeResponseDto] })
  async findActive(): Promise<BadgeResponseDto[]> {
    return this.badgesService.findActiveBadges();
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get badges by status' })
  @ApiOkResponse({ type: [BadgeResponseDto] })
  async findByStatus(@Param('status') status: Status): Promise<BadgeResponseDto[]> {
    return this.badgesService.findByStatus(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a badge by ID' })
  @ApiOkResponse({ type: BadgeResponseDto })
  @ApiResponse({ status: 404, description: 'Badge not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<BadgeResponseDto> {
    return this.badgesService.findOne(id);
  }

  @Get(':id/user-count')
  @ApiOperation({ summary: 'Get number of users who earned this badge' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        badgeId: { type: 'number', example: 1 },
        badgeName: { type: 'string', example: 'Water Hero' },
        userCount: { type: 'number', example: 15 }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Badge not found' })
  async getUserBadgeCount(@Param('id', ParseIntPipe) id: number): Promise<{ badgeId: number; badgeName: string; userCount: number }> {
    const badge = await this.badgesService.findOne(id);
    const userCount = await this.badgesService.getUserBadgeCount(id);

    return {
      badgeId: badge.id,
      badgeName: badge.name,
      userCount
    };
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a badge' })
  @ApiOkResponse({ type: BadgeResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Badge not found' })
  @ApiResponse({ status: 409, description: 'Badge name already exists' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBadgeDto: UpdateBadgeDto,
  ): Promise<BadgeResponseDto> {
    return this.badgesService.update(id, updateBadgeDto);
  }

  @Patch(':id/activate')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate a badge' })
  @ApiOkResponse({ type: BadgeResponseDto })
  @ApiResponse({ status: 404, description: 'Badge not found' })
  async activate(@Param('id', ParseIntPipe) id: number): Promise<BadgeResponseDto> {
    return this.badgesService.activateBadge(id);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate a badge' })
  @ApiOkResponse({ type: BadgeResponseDto })
  @ApiResponse({ status: 404, description: 'Badge not found' })
  async deactivate(@Param('id', ParseIntPipe) id: number): Promise<BadgeResponseDto> {
    return this.badgesService.deactivateBadge(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a badge (soft delete)' })
  @ApiResponse({ status: 204, description: 'Badge deleted' })
  @ApiResponse({ status: 404, description: 'Badge not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.badgesService.remove(id);
  }
}