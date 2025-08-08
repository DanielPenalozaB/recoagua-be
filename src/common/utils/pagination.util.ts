import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { PaginationDto, PaginationMeta } from '../dto/pagination.dto';

export async function paginate<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  page: number,
  limit: number
): Promise<PaginationDto<T>> {
  const skip = (page - 1) * limit;

  const [items, totalItems] = await queryBuilder
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  const totalPages = Math.ceil(totalItems / limit);

  const meta: PaginationMeta = {
    page,
    limit,
    totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages
  };

  return {
    data: items,
    meta
  };
}

export function applySort<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  sortBy: string,
  sortDirection: 'ASC' | 'DESC'
): SelectQueryBuilder<T> {
  if (sortBy) {
    const sortField = sortBy.includes('.') ? sortBy : `entity.${sortBy}`;
    queryBuilder.orderBy(sortField, sortDirection);
  }
  return queryBuilder;
}

export function applySearch<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  search: string,
  searchFields: string[]
): SelectQueryBuilder<T> {
  if (search && searchFields.length > 0) {
    const searchConditions = searchFields.map(field =>
      `LOWER(${field}) LIKE LOWER(:search)`
    ).join(' OR ');

    queryBuilder.andWhere(`(${searchConditions})`, {
      search: `%${search}%`
    });
  }
  return queryBuilder;
}