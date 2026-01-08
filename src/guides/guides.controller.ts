import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/users/enums/user-role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateGuideDto } from './dto/create-guide.dto';
import { GuideResponseDto } from './dto/guide-response.dto';
import { UpdateGuideDto } from './dto/update-guide.dto';
import { GuidesService } from './guides.service';
import { GuideFilterDto } from './dto/guide-filter.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CityResponseDto } from 'src/cities/dto/city-response.dto';
import { GuideStatus } from './enums/guide-status.enum';

@ApiTags('Guides')
@Controller('guides')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class GuidesController {
  constructor(private readonly guidesService: GuidesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new guide' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Guide created successfully', type: GuideResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async create(@Body() createGuideDto: CreateGuideDto) {
    return await this.guidesService.create(createGuideDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all guides' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Guides retrieved successfully', type: [GuideResponseDto] })
  @ApiQuery({ name: 'status', enum: GuideStatus, required: false })
  @ApiQuery({ name: 'language', type: String, required: false })
  async findAll(@Req() req, @Query() filterDto: GuideFilterDto): Promise<PaginationDto<CityResponseDto>> {
    const userId = req.user?.id || req.user?.sub;
  
    if (typeof filterDto.hideCompleted === 'string') {
      filterDto.hideCompleted = filterDto.hideCompleted === 'true';
    }

    return await this.guidesService.findAll(filterDto, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a guide by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Guide retrieved successfully', type: GuideResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Guide not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.guidesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a guide' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Guide updated successfully', type: GuideResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Guide not found' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGuideDto: UpdateGuideDto,
  ) {
    return await this.guidesService.update(id, updateGuideDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a guide' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Guide deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Guide not found' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.guidesService.remove(id);
    return { message: 'Guide deleted successfully' };
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish a guide' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Guide published successfully', type: GuideResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Guide not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Cannot publish guide without modules' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async publish(@Param('id', ParseIntPipe) id: number) {
    return await this.guidesService.publish(id);
  }

  @Get(':id/progress/:userId')
  @ApiOperation({ summary: 'Get user progress for a specific guide' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User progress retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Guide or user not found' })
  async getUserProgress(
    @Param('id', ParseIntPipe) guideId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.guidesService.getUserProgress(guideId, userId);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get guide statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Guide statistics retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Guide not found' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async getStats(@Param('id', ParseIntPipe) id: number) {
    return await this.guidesService.getGuideStats(id);
  }
}