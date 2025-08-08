import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRegionDto {
  @ApiProperty({ example: 'Andina', description: 'Region name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Region with high mountains',
    description: 'Region description',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'es', description: 'Language code' })
  @IsString()
  @IsNotEmpty()
  language: string;
}