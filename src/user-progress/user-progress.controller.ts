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
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateUserProgressDto } from './dto/create-user-progress.dto';
import { UpdateUserProgressDto } from './dto/update-user-progress.dto';
import { UserProgressResponseDto } from './dto/user-progress-response.dto';
import { UserProgressService } from './user-progress.service';

@ApiTags('User Progress')
@Controller('user-progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserProgressController {
  constructor(private readonly userProgressService: UserProgressService) {}

  @Post()
  @ApiOperation({ summary: 'Create new user progress record' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Progress record created successfully', type: UserProgressResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Progress record already exists or invalid data' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User, guide, or module not found' })
  async create(@Body() createUserProgressDto: CreateUserProgressDto) {
    return await this.userProgressService.create(createUserProgressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user progress records' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Progress records retrieved successfully', type: [UserProgressResponseDto] })
  @ApiQuery({ name: 'userId', type: Number, required: false })
  @ApiQuery({ name: 'guideId', type: Number, required: false })
  async findAll(
    @Query('userId') userId?: number,
    @Query('guideId') guideId?: number,
  ) {
    return await this.userProgressService.findAll(userId, guideId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a progress record by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Progress record retrieved successfully', type: UserProgressResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Progress record not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.userProgressService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a progress record' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Progress record updated successfully', type: UserProgressResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Progress record not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserProgressDto: UpdateUserProgressDto,
  ) {
    return await this.userProgressService.update(id, updateUserProgressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a progress record' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Progress record deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Progress record not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.userProgressService.remove(id);
    return { message: 'Progress record deleted successfully' };
  }

  @Post('complete-module')
  @ApiOperation({ summary: 'Mark a module as completed for a user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Module marked as completed', type: UserProgressResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User or module not found' })
  async markAsCompleted(
    @Body() completeDto: { userId: number; moduleId: number; earnedPoints: number },
  ) {
    return await this.userProgressService.markAsCompleted(
      completeDto.userId,
      completeDto.moduleId,
      completeDto.earnedPoints,
    );
  }

  @Get('user/:userId/stats')
  @ApiOperation({ summary: 'Get user learning statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User statistics retrieved successfully' })
  async getUserStats(@Param('userId', ParseIntPipe) userId: number) {
    return await this.userProgressService.getUserStats(userId);
  }

  @Get('user/:userId/guide/:guideId')
  @ApiOperation({ summary: 'Get user progress for a specific guide' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Guide progress retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User or guide not found' })
  async getGuideProgress(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('guideId', ParseIntPipe) guideId: number,
  ) {
    return await this.userProgressService.getGuideProgress(userId, guideId);
  }
}