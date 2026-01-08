import { PartialType, OmitType } from "@nestjs/swagger";
import { CreateModuleDto2 } from "./create-module.dto";

export class UpdateModuleDto extends PartialType(
  OmitType(CreateModuleDto2, ["guideId"] as const)
) {}
