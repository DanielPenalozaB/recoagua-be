import { ApiProperty } from '@nestjs/swagger';
import { BlockType } from '../enums/block-type.enum';
import { DynamicType } from '../enums/dynamic-type.enum';
import { QuestionType } from '../enums/question-type.enum';
import { BlockAnswerResponseDto } from './block-answer-response.dto';
import { RelationalPairResponseDto } from './relational-pair-response.dto';

export class BlockResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: BlockType })
  type: BlockType;

  @ApiProperty()
  order: number;

  @ApiProperty()
  statement: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  resourceUrl?: string;

  @ApiProperty()
  points: number;

  @ApiProperty({ required: false })
  feedback?: string;

  @ApiProperty({ enum: DynamicType, required: false })
  dynamicType?: DynamicType;

  @ApiProperty({ enum: QuestionType, required: false })
  questionType?: QuestionType;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [BlockAnswerResponseDto], required: false })
  answers?: BlockAnswerResponseDto[];

  @ApiProperty({ type: [RelationalPairResponseDto], required: false })
  relationalPairs?: RelationalPairResponseDto[];

  @ApiProperty({ description: 'User response status for this block' })
  userResponseStatus?: string;
}