import { ApiProperty } from '@nestjs/swagger';
import { ModuleStatus } from '../enums/module-status.enum';
import { BlockResponseDto } from 'src/blocks/dto/block-response.dto';

export class ModuleResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  order: number;

  @ApiProperty()
  points: number;

  @ApiProperty({ enum: ModuleStatus })
  status: ModuleStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [BlockResponseDto], required: false })
  blocks?: BlockResponseDto[];

  @ApiProperty({ description: 'Number of blocks in this module' })
  blockCount?: number;

  @ApiProperty({ description: 'User completion status for this module' })
  userCompletionStatus?: string;
}