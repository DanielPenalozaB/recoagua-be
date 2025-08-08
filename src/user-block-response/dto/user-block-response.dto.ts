import { ApiProperty } from '@nestjs/swagger';
import { BlockResponseDto } from '../../blocks/dto/block-response.dto';

export class UserBlockResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  isCorrect: boolean;

  @ApiProperty()
  submittedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: BlockResponseDto, required: false })
  block?: BlockResponseDto;
}