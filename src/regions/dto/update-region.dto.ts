import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRegionDto {
  @ApiProperty({ example: 'Andina', description: 'Region name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'Region with high mountains',
    description: 'Region description',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'es', description: 'Language code', required: false })
  @IsString()
  @IsOptional()
  language?: string;
}