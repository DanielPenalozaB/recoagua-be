import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateZoneDto {
  @ApiProperty({
    example: 'Highland Water Zone',
    description: 'The name of the zone'
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Zone with high rainfall and good water retention',
    description: 'Description of the zone',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 1200,
    description: 'Average rainfall in mm',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rainfall?: number;

  @ApiProperty({
    example: 4.6097,
    description: 'Latitude coordinate'
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    example: -74.0817,
    description: 'Longitude coordinate'
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({
    example: 'Use terraces for water retention',
    description: 'Recommendations for this zone',
    required: false,
  })
  @IsOptional()
  @IsString()
  recommendations?: string;

  @ApiProperty({
    example: 'active',
    description: 'Status of the zone record'
  })
  @IsNotEmpty()
  @IsString()
  status: string;

  @ApiProperty({
    example: 2600,
    description: 'Altitude in meters above sea level',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  altitude?: number;

  @ApiProperty({
    example: 'clay',
    description: 'Type of soil in the zone',
    required: false
  })
  @IsOptional()
  @IsString()
  soilType?: string;

  @ApiProperty({
    example: 14.5,
    description: 'Average temperature in Celsius',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(-50)
  @Max(60)
  avgTemperature?: number;

  @ApiProperty({
    example: 1,
    description: 'ID of the city this zone belongs to'
  })
  @IsNotEmpty()
  @IsNumber()
  cityId: number;
}