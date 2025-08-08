import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCityDto {
  @ApiProperty({ example: 'Bogotá', description: 'City name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Capital of Colombia', description: 'City description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 800, description: 'Average rainfall in mm', required: false })
  @IsNumber()
  @IsOptional()
  rainfall?: number;

  @ApiProperty({ example: 'es', description: 'Language code' })
  @IsString()
  @IsNotEmpty()
  language: string;

  @ApiProperty({ example: 1, description: 'Region ID', required: false })
  @IsNumber()
  @IsOptional()
  regionId?: number;
}