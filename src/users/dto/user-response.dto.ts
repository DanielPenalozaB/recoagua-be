import { ApiProperty } from '@nestjs/swagger';
import { CityResponseDto } from '../../cities/dto/city-response.dto';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';

export class UserResponseDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  id: number;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  name: string;

  @ApiProperty({ example: 'es', description: 'Preferred language' })
  language: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CITIZEN, description: 'User role' })
  role: UserRole;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE, description: 'User status' })
  status: UserStatus;

  @ApiProperty({ type: () => CityResponseDto, nullable: true, description: 'User city' })
  city: CityResponseDto | null;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Last update date' })
  updatedAt: Date;

  @ApiProperty({ example: true, description: 'Email confirmation status' })
  emailConfirmed: boolean;

  @ApiProperty({ example: true, description: 'Whether password is set', required: false })
  passwordSet?: boolean;
}

export class UserWithPasswordDto extends UserResponseDto {
  @ApiProperty({ description: 'Hashed password', required: true })
  password: string;

  @ApiProperty({ description: 'Password reset token', required: false })
  passwordResetToken?: string | null;

  @ApiProperty({ description: 'Password reset expiration', required: false })
  passwordResetExpires?: Date | null;

  @ApiProperty({ description: 'Email confirmation token', required: false })
  emailConfirmationToken?: string | null;
}