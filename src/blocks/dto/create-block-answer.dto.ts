import { IsString, IsBoolean, IsNumber, IsOptional, MinLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBlockAnswerDto {
  @ApiProperty({ example: 'Evaporation, Condensation, Precipitation' })
  @IsString()
  @MinLength(1)
  text: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isCorrect: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  feedback?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  order: number;

  @ApiProperty({ example: 1, description: 'Block ID' })
  @IsNumber()
  blockId: number;
}