import { IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserBlockResponseDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 1, description: 'Block ID' })
  @IsNumber()
  blockId: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isCorrect: boolean;
}