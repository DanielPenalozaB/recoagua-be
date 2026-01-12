import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ChallengeDifficulty } from '../enums/challenge-difficult.enum';
import { ChallengeStatus } from '../enums/challenge-status.enum';
import { ChallengeType } from '../enums/challenge-type.enum';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class ChallengeFilterDto extends PaginationQueryDto {
  @ApiProperty({
    required: false,
    description: 'Search by name or description',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by exact name',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    enum: ChallengeDifficulty,
    required: false,
    description: 'Filter by difficulty',
  })
  @IsEnum(ChallengeDifficulty)
  @IsOptional()
  difficulty?: ChallengeDifficulty;

  @ApiProperty({
    enum: ChallengeStatus,
    required: false,
    description: 'Filter by status',
  })
  @IsEnum(ChallengeStatus)
  @IsOptional()
  status?: ChallengeStatus;

  @ApiProperty({
    enum: ChallengeType,
    required: false,
    description: 'Filter by type',
  })
  @IsEnum(ChallengeType)
  @IsOptional()
  challengeType?: ChallengeType;

  @ApiProperty({
    required: false,
    description: 'Filter by minimum score',
  })
  @IsNumber()
  @IsOptional()
  minScore?: number;

  @ApiProperty({
    required: false,
    description: 'Filter by maximum score',
  })
  @IsNumber()
  @IsOptional()
  maxScore?: number;
}