import { ApiProperty } from '@nestjs/swagger';

export class LevelResponseDto {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the level',
  })
  id: number;

  @ApiProperty({
    example: 'Water Guardian',
    description: 'The name of the level',
  })
  name: string;

  @ApiProperty({
    example: 'Achieved by saving significant amounts of water',
    description: 'Description of the level',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    example: 500,
    description: 'Points required to reach this level',
  })
  requiredPoints: number;

  @ApiProperty({
    example: 'Special avatar frame',
    description: 'Rewards for reaching this level',
    nullable: true,
  })
  rewards: string | null;

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