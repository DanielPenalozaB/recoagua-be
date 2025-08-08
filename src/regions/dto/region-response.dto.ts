import { ApiProperty } from '@nestjs/swagger';

export class RegionResponseDto {
  @ApiProperty({ example: 1, description: 'Region ID' })
  id: number;

  @ApiProperty({ example: 'Andina', description: 'Region name' })
  name: string;

  @ApiProperty({
    example: 'Region with high mountains',
    description: 'Region description',
    required: false
  })
  description?: string;

  @ApiProperty({ example: 'es', description: 'Language code' })
  language: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}