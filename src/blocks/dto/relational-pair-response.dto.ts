import { ApiProperty } from '@nestjs/swagger';

export class RelationalPairResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  leftItem: string;

  @ApiProperty()
  rightItem: string;

  @ApiProperty()
  correctPair: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}