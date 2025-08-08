import { ApiProperty } from '@nestjs/swagger';

export class CityResponseDto {
  @ApiProperty({ example: 1, description: 'City ID' })
  id: number;

  @ApiProperty({ example: 'Bogotá', description: 'City name' })
  name: string;

  @ApiProperty({ example: 'Capital of Colombia', description: 'City description', required: false })
  description?: string;

  @ApiProperty({ example: 800, description: 'Average rainfall in mm', required: false })
  rainfall?: number;

  @ApiProperty({ example: 'es', description: 'Language code' })
  language: string;

  @ApiProperty({ example: 1, description: 'Region ID', required: false })
  regionId?: number | null;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}