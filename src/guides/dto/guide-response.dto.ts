import { ApiProperty } from '@nestjs/swagger';
import { GuideDifficulty, GuideStatus } from '../entities/guide.entity';
import { ModuleResponseDto } from 'src/modules/dto/module-response.dto';

export class GuideResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: GuideDifficulty })
  difficulty: GuideDifficulty;

  @ApiProperty()
  estimatedDuration: number;

  @ApiProperty({ enum: GuideStatus })
  status: GuideStatus;

  @ApiProperty()
  language: string;

  @ApiProperty()
  totalPoints: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [ModuleResponseDto], required: false })
  modules?: ModuleResponseDto[];

  @ApiProperty({ description: 'Number of modules in this guide' })
  moduleCount?: number;

  @ApiProperty({ description: 'Average completion percentage for this guide' })
  averageCompletion?: number;
}