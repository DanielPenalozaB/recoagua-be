import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class CityFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search by name',
    example: 'Bogotá'
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by region ID',
    example: 1
  })
  @IsOptional()
  regionId?: number;
}