import { IsString, IsBoolean, IsNumber, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRelationalPairDto {
  @ApiProperty({ example: 'Evaporation' })
  @IsString()
  @MinLength(1)
  leftItem: string;

  @ApiProperty({ example: 'Water turns into vapor' })
  @IsString()
  @MinLength(1)
  rightItem: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  correctPair: boolean;

  @ApiProperty({ example: 1, description: 'Block ID' })
  @IsNumber()
  blockId: number;
}