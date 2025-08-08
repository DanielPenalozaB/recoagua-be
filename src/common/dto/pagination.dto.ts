import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({ description: 'Current page number' })
  page!: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit!: number;

  @ApiProperty({ description: 'Total number of items' })
  totalItems!: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages!: number;

  @ApiProperty({ description: 'Whether there is a previous page' })
  hasPreviousPage!: boolean;

  @ApiProperty({ description: 'Whether there is a next page' })
  hasNextPage!: boolean;
}

export class PaginationDto<T> {
  @ApiProperty({ isArray: true, description: 'Array of items' })
  data!: T[];

  @ApiProperty({ type: PaginationMeta, description: 'Pagination metadata' })
  meta!: PaginationMeta;
}
