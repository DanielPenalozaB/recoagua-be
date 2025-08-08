import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query,
  ParseIntPipe,
  HttpStatus,
  UseGuards
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiQuery,
  ApiBearerAuth 
} from '@nestjs/swagger';
import { UserBlockResponseService } from './user-block-response.service';
import { CreateUserBlockResponseDto } from './dto/create-user-block-response.dto';
import { UserBlockResponseDto } from './dto/user-block-response.dto';

@ApiTags('User Block Responses')
@Controller('user-block-responses')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
export class UserBlockResponseController {
  constructor(private readonly userBlockResponseService: UserBlockResponseService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a response to a block' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Response submitted successfully', type: UserBlockResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User or block not found' })
  async create(@Body() createDto: CreateUserBlockResponseDto) {
    return await this.userBlockResponseService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all block responses' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Responses retrieved successfully', type: [UserBlockResponseDto] })
  @ApiQuery({ name: 'userId', type: Number, required: false })
  @ApiQuery({ name: 'blockId', type: Number, required: false })
  async findAll(
    @Query('userId') userId?: number,
    @Query('blockId') blockId?: number,
  ) {
    return await this.userBlockResponseService.findAll(userId, blockId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a block response by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Response retrieved successfully', type: UserBlockResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Response not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.userBlockResponseService.findOne(id);
  }

  @Get('user/:userId/block/:blockId')
  @ApiOperation({ summary: 'Get user response for a specific block' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User response retrieved successfully', type: UserBlockResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Response not found' })
  async findByUserAndBlock(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('blockId', ParseIntPipe) blockId: number,
  ) {
    return await this.userBlockResponseService.findByUserAndBlock(userId, blockId);
  }

  @Get('user/:userId/stats')
  @ApiOperation({ summary: 'Get user block response statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User statistics retrieved successfully' })
  async getUserBlockStats(@Param('userId', ParseIntPipe) userId: number) {
    return await this.userBlockResponseService.getUserBlockStats(userId);
  }

  @Get('block/:blockId/stats')
  @ApiOperation({ summary: 'Get block response statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Block statistics retrieved successfully' })
  async getBlockStats(@Param('blockId', ParseIntPipe) blockId: number) {
    return await this.userBlockResponseService.getBlockStats(blockId);
  }
}