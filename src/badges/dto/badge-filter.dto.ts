import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Status } from 'src/common/enums/status.enum';

export class BadgeFilterDto extends PaginationQueryDto {
  @ApiProperty({
    required: false,
    description: 'Search by name, description, or requirements',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    enum: Status,
    required: false,
    description: 'Filter by status',
  })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}