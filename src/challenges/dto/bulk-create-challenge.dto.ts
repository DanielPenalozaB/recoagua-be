import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';
import { CreateChallengeDto } from './create-challenge.dto';

export class BulkCreateChallengeDto {
  @ApiProperty({
    type: [CreateChallengeDto],
    description: 'Array of challenges to create',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChallengeDto)
  challenges: CreateChallengeDto[];
}