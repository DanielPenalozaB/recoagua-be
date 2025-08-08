import { IsEnum, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CompletionStatus } from '../enums/completion-status.enum';

export class UpdateUserProgressDto {
  @ApiProperty({ enum: CompletionStatus, required: false })
  @IsEnum(CompletionStatus)
  @IsOptional()
  completionStatus?: CompletionStatus;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  completedAt?: Date;

  @ApiProperty({ example: 25, required: false })
  @IsNumber()
  @IsOptional()
  earnedPoints?: number;
}