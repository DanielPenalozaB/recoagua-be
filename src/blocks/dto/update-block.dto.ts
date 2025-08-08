import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateBlockDto } from './create-block.dto';

export class UpdateBlockDto extends PartialType(
  OmitType(CreateBlockDto, ['moduleId'] as const)
) {}