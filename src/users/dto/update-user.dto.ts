import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';

export class UpdateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'John Doe', description: 'User full name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 1, description: 'City ID', required: false })
  @IsNumber()
  @IsOptional()
  cityId?: number;

  @ApiProperty({ example: 'es', description: 'Preferred language', required: false })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CITIZEN, description: 'User role', required: false })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE, description: 'User status', required: false })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}