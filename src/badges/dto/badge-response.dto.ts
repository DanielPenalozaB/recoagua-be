import { ApiProperty } from '@nestjs/swagger';
import { Status } from 'src/common/enums/status.enum';

export class BadgeResponseDto {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the badge',
  })
  id: number;

  @ApiProperty({
    example: 'Water Hero',
    description: 'The name of the badge'
  })
  name: string;

  @ApiProperty({
    example: 'Awarded for exceptional water conservation efforts',
    description: 'Description of the badge',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    example: 'https://example.com/badges/water-hero.png',
    description: 'URL to badge image',
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({
    example: 'Complete 5 water conservation guides',
    description: 'Requirements to earn this badge',
  })
  requirements: string;

  @ApiProperty({
    enum: Status,
    description: 'Status of the badge'
  })
  status: Status;

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