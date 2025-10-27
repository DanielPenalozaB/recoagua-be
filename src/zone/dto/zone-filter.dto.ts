import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class ZoneFilterDto extends PaginationQueryDto {
  @ApiProperty({
    required: false,
    description: 'Search by name, description, or recommendations',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by city ID',
  })
  @IsNumber()
  @IsOptional()
  cityId?: number;

  @ApiProperty({
    required: false,
    description: 'Filter by status',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by soil type',
  })
  @IsString()
  @IsOptional()
  soilType?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by minimum rainfall',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minRainfall?: number;

  @ApiProperty({
    required: false,
    description: 'Filter by maximum rainfall',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxRainfall?: number;

  @ApiProperty({
    required: false,
    description: 'Filter by minimum altitude',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minAltitude?: number;

  @ApiProperty({
    required: false,
    description: 'Filter by maximum altitude',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxAltitude?: number;
}