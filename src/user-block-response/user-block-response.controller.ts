import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { SubmitBlockResponseDto } from "./dto/submit-block-response.dto";
import { UserBlockResponseDto } from "./dto/user-block-response.dto";
import { UserBlockResponseService } from "./user-block-response.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@ApiTags("User Block Responses")
@Controller("user-block-responses")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserBlockResponseController {
  constructor(
    private readonly userBlockResponseService: UserBlockResponseService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Submit user response for a block" })
  @ApiResponse({ status: 201, description: "Response recorded" })
  async submitResponse(@Body() dto: SubmitBlockResponseDto, @Req() req: any) {
    // req.user should have the authenticated user's info
    const userId = req.user?.id || req.user?.sub;
    return await this.userBlockResponseService.submitResponse(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: "Get all block responses" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Responses retrieved successfully",
    type: [UserBlockResponseDto],
  })
  @ApiQuery({ name: "userId", type: Number, required: false })
  @ApiQuery({ name: "blockId", type: Number, required: false })
  async findAll(
    @Query("userId") userId?: number,
    @Query("blockId") blockId?: number
  ) {
    return await this.userBlockResponseService.findAll(userId, blockId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a block response by ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Response retrieved successfully",
    type: UserBlockResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Response not found",
  })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return await this.userBlockResponseService.findOne(id);
  }

  @Get("user/:userId/block/:blockId")
  @ApiOperation({ summary: "Get user response for a specific block" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User response retrieved successfully",
    type: UserBlockResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Response not found",
  })
  async findByUserAndBlock(
    @Param("userId", ParseIntPipe) userId: number,
    @Param("blockId", ParseIntPipe) blockId: number
  ) {
    return await this.userBlockResponseService.findByUserAndBlock(
      userId,
      blockId
    );
  }

  @Get("user/:userId/stats")
  @ApiOperation({ summary: "Get user block response statistics" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User statistics retrieved successfully",
  })
  async getUserBlockStats(@Param("userId", ParseIntPipe) userId: number) {
    return await this.userBlockResponseService.getUserBlockStats(userId);
  }

  @Get("block/:blockId/stats")
  @ApiOperation({ summary: "Get block response statistics" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Block statistics retrieved successfully",
  })
  async getBlockStats(@Param("blockId", ParseIntPipe) blockId: number) {
    return await this.userBlockResponseService.getBlockStats(blockId);
  }
}
