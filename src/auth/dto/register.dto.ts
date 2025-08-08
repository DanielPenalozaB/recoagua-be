import { IsEmail, IsNotEmpty, IsString, MinLength, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'securePassword123',
    description: 'User password (min 6 characters)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 1,
    description: 'ID of the user\'s city',
  })
  @IsNumber()
  @IsNotEmpty()
  cityId: number;

  @ApiProperty({
    example: 'es',
    description: 'User preferred language',
  })
  @IsString()
  @IsNotEmpty()
  language: string;
}