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
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { BlocksService } from "./blocks.service";
import { BlockAnswerResponseDto } from "./dto/block-answer-response.dto";
import { BlockResponseDto } from "./dto/block-response.dto";
import { CreateBlockAnswerDto } from "./dto/create-block-answer.dto";
import { CreateBlockDto2 } from "./dto/create-block.dto";
import { CreateRelationalPairDto2 } from "./dto/create-relational-pair.dto";
import { RelationalPairResponseDto } from "./dto/relational-pair-response.dto";
import { UpdateBlockDto } from "./dto/update-block.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@ApiTags("Blocks")
@Controller("blocks")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Post()
  @ApiOperation({ summary: "Create a new block" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Block created successfully",
    type: BlockResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input data or duplicate order",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Module not found",
  })
  async create(@Body() CreateBlockDto2: CreateBlockDto2) {
    return await this.blocksService.create(CreateBlockDto2);
  }

  @Get()
  @ApiOperation({ summary: "Get all blocks" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Blocks retrieved successfully",
    type: [BlockResponseDto],
  })
  @ApiQuery({ name: "moduleId", type: Number, required: false })
  async findAll(@Query("moduleId") moduleId?: number) {
    return await this.blocksService.findAll(moduleId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a block by ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Block retrieved successfully",
    type: BlockResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Block not found" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return await this.blocksService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a block" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Block updated successfully",
    type: BlockResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Block not found" })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Duplicate order in module",
  })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateBlockDto: UpdateBlockDto
  ) {
    return await this.blocksService.update(id, updateBlockDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a block" })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Block deleted successfully",
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Block not found" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.blocksService.remove(id);
    return { message: "Block deleted successfully" };
  }

  @Patch("modules/:moduleId/reorder")
  @ApiOperation({ summary: "Reorder blocks within a module" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Blocks reordered successfully",
    type: [BlockResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Module not found",
  })
  async reorderBlocks(
    @Param("moduleId", ParseIntPipe) moduleId: number,
    @Body() blockOrders: { id: number; order: number }[]
  ) {
    return await this.blocksService.reorderBlocks(moduleId, blockOrders);
  }

  @Post("answers")
  @ApiOperation({ summary: "Create a new block answer" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Answer created successfully",
    type: BlockAnswerResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Block not found" })
  async createAnswer(@Body() createAnswerDto: CreateBlockAnswerDto) {
    return await this.blocksService.createAnswer(createAnswerDto);
  }

  @Patch("answers/:id")
  @ApiOperation({ summary: "Update a block answer" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Answer updated successfully",
    type: BlockAnswerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Answer not found",
  })
  async updateAnswer(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateData: Partial<CreateBlockAnswerDto>
  ) {
    return await this.blocksService.updateAnswer(id, updateData);
  }

  @Delete("answers/:id")
  @ApiOperation({ summary: "Delete a block answer" })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Answer deleted successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Answer not found",
  })
  async removeAnswer(@Param("id", ParseIntPipe) id: number) {
    await this.blocksService.removeAnswer(id);
    return { message: "Answer deleted successfully" };
  }

  @Post("relational-pairs")
  @ApiOperation({ summary: "Create a new relational pair" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Relational pair created successfully",
    type: RelationalPairResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Block not found" })
  async createRelationalPair(@Body() createPairDto: CreateRelationalPairDto2) {
    return await this.blocksService.createRelationalPair(createPairDto);
  }

  @Patch("relational-pairs/:id")
  @ApiOperation({ summary: "Update a relational pair" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Relational pair updated successfully",
    type: RelationalPairResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Relational pair not found",
  })
  async updateRelationalPair(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateData: Partial<CreateRelationalPairDto2>
  ) {
    return await this.blocksService.updateRelationalPair(id, updateData);
  }

  @Delete("relational-pairs/:id")
  @ApiOperation({ summary: "Delete a relational pair" })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Relational pair deleted successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Relational pair not found",
  })
  async removeRelationalPair(@Param("id", ParseIntPipe) id: number) {
    await this.blocksService.removeRelationalPair(id);
    return { message: "Relational pair deleted successfully" };
  }
}
