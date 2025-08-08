import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmEmailDto {
  @ApiProperty({
    example: 'emailConfirmationToken123',
    description: 'Email confirmation token received via email',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}