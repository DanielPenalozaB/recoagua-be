import { IsString, IsEnum, IsNumber, IsOptional, IsArray, ValidateNested, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateAnswerDto } from './create-answer.dto';
import { CreateRelationalPairDto } from './create-relational-pair.dto';
import { BlockType } from 'src/blocks/enums/block-type.enum';
import { DynamicType } from 'src/blocks/enums/dynamic-type.enum';
import { QuestionType } from 'src/blocks/enums/question-type.enum';
import { IsValidBlockStructure } from '../validators/is-valid-block-structure.validator';

export class CreateBlockDto {
  @ApiProperty({ enum: BlockType, description: 'Type of the content block' })
  @IsEnum(BlockType)
  type: BlockType;

  @ApiProperty({ example: 1, description: 'Order of the block within the module' })
  @IsNumber()
  order: number;

  @ApiProperty({ example: 'What is the water cycle?', description: 'Statement or question for the block' })
  @IsString()
  statement: string;

  @ApiProperty({ example: 'The water cycle describes how water evaporates...', description: 'Additional description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://example.com/video.mp4', description: 'URL to external resource', required: false })
  @IsUrl()
  @IsOptional()
  resourceUrl?: string;

  @ApiProperty({ example: 10, description: 'Points achievable from this block' })
  @IsNumber()
  points: number;

  @ApiProperty({ example: 'Good job! You got it right.', description: 'Feedback for the user', required: false })
  @IsString()
  @IsOptional()
  feedback?: string;

  @ApiProperty({ enum: DynamicType, description: 'Type of interactive dynamic', required: false })
  @IsEnum(DynamicType)
  @IsOptional()
  dynamicType?: DynamicType;

  @ApiProperty({ enum: QuestionType, description: 'Type of question', required: false })
  @IsEnum(QuestionType)
  @IsOptional()
  questionType?: QuestionType;

  @ApiProperty({ type: [CreateAnswerDto], description: 'Answers for question blocks', required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerDto)
  @IsOptional()
  answers?: CreateAnswerDto[];

  @ApiProperty({ type: [CreateRelationalPairDto], description: 'Relational pairs for matching questions', required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRelationalPairDto)
  @IsOptional()
  relationalPairs?: CreateRelationalPairDto[];

  // Add this property for class-level validation
  @IsValidBlockStructure()
  isValidBlockStructure: boolean;
}