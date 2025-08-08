import { IsNumber, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CompletionStatus } from '../enums/completion-status.enum';

export class CreateUserProgressDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 1, description: 'Guide ID' })
  @IsNumber()
  guideId: number;

  @ApiProperty({ example: 1, description: 'Module ID' })
  @IsNumber()
  moduleId: number;

  @ApiProperty({ enum: CompletionStatus, required: false })
  @IsEnum(CompletionStatus)
  @IsOptional()
  completionStatus?: CompletionStatus = CompletionStatus.NOT_STARTED;

  @ApiProperty({ example: 0, description: 'Points earned', required: false })
  @IsNumber()
  @IsOptional()
  earnedPoints?: number = 0;
}