import { ApiProperty } from '@nestjs/swagger';
import { CompletionStatus } from '../enums/completion-status.enum';
import { GuideResponseDto } from '../../guides/dto/guide-response.dto';
import { ModuleResponseDto } from '../../modules/dto/module-response.dto';

export class UserProgressResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: CompletionStatus })
  completionStatus: CompletionStatus;

  @ApiProperty({ required: false })
  completedAt?: Date;

  @ApiProperty()
  earnedPoints: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: GuideResponseDto, required: false })
  guide?: GuideResponseDto;

  @ApiProperty({ type: ModuleResponseDto, required: false })
  module?: ModuleResponseDto;

  @ApiProperty({ description: 'Progress percentage for this module' })
  progressPercentage?: number;
}