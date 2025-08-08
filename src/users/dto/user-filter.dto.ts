import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class UserFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search by name or email',
    example: 'john'
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    description: 'Filter by role'
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    enum: UserStatus,
    description: 'Filter by status'
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    description: 'Filter by city ID',
    example: 1
  })
  @IsOptional()
  cityId?: number;

  @ApiPropertyOptional({
    description: 'Filter by language',
    example: 'es'
  })
  @IsOptional()
  @IsString()
  language?: string;
}