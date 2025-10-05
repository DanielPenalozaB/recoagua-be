import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CreateLevelDto {
  @ApiProperty({
    example: 'Water Guardian',
    description: 'The name of the level',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Achieved by saving significant amounts of water',
    description: 'Description of the level',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 500,
    description: 'Points required to reach this level',
  })
  @IsNumber()
  @Min(0)
  requiredPoints: number;

  @ApiProperty({
    example: 'Special avatar frame',
    description: 'Rewards for reaching this level',
    required: false,
  })
  @IsOptional()
  @IsString()
  rewards?: string;
}