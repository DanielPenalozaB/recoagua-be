import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateUserChallengeDto {
  @ApiProperty({ example: 1, description: 'Challenge ID' })
  @IsNumber()
  challengeId: number;
}
