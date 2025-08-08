import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateModuleDto } from './create-module.dto';

export class UpdateModuleDto extends PartialType(
  OmitType(CreateModuleDto, ['guideId'] as const)
) {}