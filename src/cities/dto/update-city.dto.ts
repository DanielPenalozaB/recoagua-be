import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCityDto {
  @ApiProperty({ example: 'Bogotá', description: 'City name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Capital of Colombia', description: 'City description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 800, description: 'Average rainfall in mm', required: false })
  @IsNumber()
  @IsOptional()
  rainfall?: number;

  @ApiProperty({ example: 'es', description: 'Language code', required: false })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({ example: 1, description: 'Region ID', required: false })
  @IsNumber()
  @IsOptional()
  regionId?: number;
}