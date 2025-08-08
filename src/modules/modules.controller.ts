import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ModuleResponseDto } from './dto/module-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Modules')
@Controller('modules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new module' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Module created successfully', type: ModuleResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data or duplicate order' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Guide not found' })
  async create(@Body() createModuleDto: CreateModuleDto) {
    return await this.modulesService.create(createModuleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all modules' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Modules retrieved successfully', type: [ModuleResponseDto] })
  @ApiQuery({ name: 'guideId', type: Number, required: false })
  async findAll(@Query('guideId', ParseIntPipe) guideId?: number) {
    return await this.modulesService.findAll(guideId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a module by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Module retrieved successfully', type: ModuleResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Module not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.modulesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a module' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Module updated successfully', type: ModuleResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Module not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Duplicate order in guide' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    return await this.modulesService.update(id, updateModuleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a module' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Module deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Module not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.modulesService.remove(id);
    return { message: 'Module deleted successfully' };
  }

  @Patch('guides/:guideId/reorder')
  @ApiOperation({ summary: 'Reorder modules within a guide' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Modules reordered successfully', type: [ModuleResponseDto] })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Guide not found' })
  async reorderModules(
    @Param('guideId', ParseIntPipe) guideId: number,
    @Body() moduleOrders: { id: number; order: number }[],
  ) {
    return await this.modulesService.reorderModules(guideId, moduleOrders);
  }
}