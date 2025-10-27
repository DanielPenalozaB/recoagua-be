import { ApiProperty } from '@nestjs/swagger';

class CitySummaryDto {
  @ApiProperty({ example: 1, description: 'The unique identifier of the city' })
  id: number;

  @ApiProperty({ example: 'Bogotá', description: 'The name of the city' })
  name: string;

  @ApiProperty({ example: 'Capital of Colombia', description: 'Description of the city' })
  description: string;

  @ApiProperty({ example: 800, description: 'Average rainfall in mm' })
  rainfall: number;

  @ApiProperty({ example: 'es', description: 'Language code' })
  language: string;
}

export class ZoneResponseDto {
  @ApiProperty({ example: 1, description: 'The unique identifier of the zone' })
  id: number;

  @ApiProperty({ example: 'Highland Water Zone', description: 'The name of the zone' })
  name: string;

  @ApiProperty({
    example: 'Zone with high rainfall and good water retention',
    description: 'Description of the zone',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({ example: 1200, description: 'Average rainfall in mm', nullable: true })
  rainfall: number | null;

  @ApiProperty({ example: 4.6097, description: 'Latitude coordinate' })
  latitude: number;

  @ApiProperty({ example: -74.0817, description: 'Longitude coordinate' })
  longitude: number;

  @ApiProperty({
    example: 'Use terraces for water retention',
    description: 'Recommendations for this zone',
    nullable: true,
  })
  recommendations: string | null;

  @ApiProperty({ example: 'active', description: 'Status of the zone record' })
  status: string;

  @ApiProperty({
    example: 2600,
    description: 'Altitude in meters above sea level',
    nullable: true,
  })
  altitude: number | null;

  @ApiProperty({ example: 'clay', description: 'Type of soil in the zone', nullable: true })
  soilType: string | null;

  @ApiProperty({
    example: 14.5,
    description: 'Average temperature in Celsius',
    nullable: true,
  })
  avgTemperature: number | null;

  @ApiProperty({ type: CitySummaryDto, description: 'City this zone belongs to' })
  city: CitySummaryDto | null;

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