import { IsString, IsNumber, IsEnum, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ModuleStatus } from 'src/modules/enums/module-status.enum';
import { CreateBlockDto } from './create-block.dto';

export class CreateModuleDto {
  @ApiProperty({ example: 'Understanding Water Cycle', description: 'The name of the module' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Learn about the water cycle process', description: 'Detailed description of the module' })
  @IsString()
  description: string;

  @ApiProperty({ example: 1, description: 'Order of the module within the guide' })
  @IsNumber()
  order: number;

  @ApiProperty({ example: 25, description: 'Points achievable from this module' })
  @IsNumber()
  points: number;

  @ApiProperty({ enum: ModuleStatus, description: 'Publication status of the module', required: false })
  @IsEnum(ModuleStatus)
  @IsOptional()
  status?: ModuleStatus = ModuleStatus.DRAFT;

  @ApiProperty({ type: [CreateBlockDto], description: 'Blocks contained in this module', required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBlockDto)
  @IsOptional()
  blocks?: CreateBlockDto[];
}