import { IsString, IsNumber, IsEnum, IsOptional, MinLength, Min, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BlockType } from '../enums/block-type.enum';
import { DynamicType } from '../enums/dynamic-type.enum';
import { QuestionType } from '../enums/question-type.enum';

export class CreateBlockDto {
  @ApiProperty({ enum: BlockType })
  @IsEnum(BlockType)
  type: BlockType;

  @ApiProperty({ example: 1, description: 'Order within the module' })
  @IsNumber()
  @Min(1)
  order: number;

  @ApiProperty({ example: 'What is the water cycle?' })
  @IsString()
  @MinLength(3)
  statement: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsUrl()
  @IsOptional()
  resourceUrl?: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  points: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  feedback?: string;

  @ApiProperty({ enum: DynamicType, required: false })
  @IsEnum(DynamicType)
  @IsOptional()
  dynamicType?: DynamicType;

  @ApiProperty({ enum: QuestionType, required: false })
  @IsEnum(QuestionType)
  @IsOptional()
  questionType?: QuestionType;

  @ApiProperty({ example: 1, description: 'Module ID' })
  @IsNumber()
  moduleId: number;
}