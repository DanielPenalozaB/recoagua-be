import { IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRelationalPairDto {
  @ApiProperty({ example: 'Evaporation', description: 'Left item of the pair' })
  @IsString()
  leftItem: string;

  @ApiProperty({ example: 'Water turns to vapor', description: 'Right item of the pair' })
  @IsString()
  rightItem: string;

  @ApiProperty({ example: true, description: 'Whether this pair is correct' })
  @IsBoolean()
  correctPair: boolean;
}