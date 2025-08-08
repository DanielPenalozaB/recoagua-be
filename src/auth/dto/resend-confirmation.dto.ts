import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendConfirmationDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address to resend confirmation',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}