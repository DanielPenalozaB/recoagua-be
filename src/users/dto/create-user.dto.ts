import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'password123', description: 'User password', required: false })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @ApiProperty({ example: 1, description: 'City ID' })
  @IsNumber()
  cityId: number;

  @ApiProperty({ example: 'es', description: 'Preferred language', required: false })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CITIZEN, description: 'User role', required: false })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ enum: UserStatus, example: UserStatus.PENDING, description: 'User status', required: false })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}