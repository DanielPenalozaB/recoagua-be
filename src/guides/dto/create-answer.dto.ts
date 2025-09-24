import { IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnswerDto {
  @ApiProperty({ example: 'Evaporation', description: 'The answer text' })
  @IsString()
  text: string;

  @ApiProperty({ example: true, description: 'Whether this answer is correct' })
  @IsBoolean()
  isCorrect: boolean;

  @ApiProperty({ example: 'Correct! This is part of the water cycle', description: 'Feedback for this answer', required: false })
  @IsString()
  @IsOptional()
  feedback?: string;

  @ApiProperty({ example: 1, description: 'Order of the answer' })
  @IsNumber()
  order: number;
}