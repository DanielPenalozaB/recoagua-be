import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class GuideFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search by name',
    example: 'Water basics'
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;
}