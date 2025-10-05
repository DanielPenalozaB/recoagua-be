import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class LevelFilterDto extends PaginationQueryDto {
  @ApiProperty({
    required: false,
    description: 'Search by name or description',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by minimum required points',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minPoints?: number;

  @ApiProperty({
    required: false,
    description: 'Filter by maximum required points',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxPoints?: number;
}