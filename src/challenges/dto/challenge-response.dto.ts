import { ApiProperty } from '@nestjs/swagger';
import { ChallengeDifficulty } from '../enums/challenge-difficult.enum';
import { ChallengeStatus } from '../enums/challenge-status.enum';
import { ChallengeType } from '../enums/challenge-type.enum';

export class ChallengeResponseDto {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the challenge',
  })
  id: number;

  @ApiProperty({
    example: 'Water Saver',
    description: 'The name of the challenge',
  })
  name: string;

  @ApiProperty({
    example: 'Save 100 liters of water in a week',
    description: 'Detailed description of the challenge',
  })
  description: string;

  @ApiProperty({
    example: 50,
    description: 'Points awarded for completing the challenge',
  })
  score: number;

  @ApiProperty({
    enum: ChallengeDifficulty,
    description: 'Difficulty level of the challenge',
  })
  difficulty: ChallengeDifficulty;

  @ApiProperty({
    enum: ChallengeStatus,
    description: 'Status of the challenge',
  })
  status: ChallengeStatus;

  @ApiProperty({
    enum: ChallengeType,
    description: 'Type of challenge',
  })
  challengeType: ChallengeType;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt: Date;

  @ApiProperty({
    example: null,
    description: 'Soft delete timestamp',
    nullable: true,
  })
  deletedAt: Date | null;
}