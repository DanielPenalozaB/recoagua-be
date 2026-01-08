import { PartialType, OmitType } from "@nestjs/swagger";
import { CreateBlockDto2 } from "./create-block.dto";

export class UpdateBlockDto extends PartialType(
  OmitType(CreateBlockDto2, ["moduleId"] as const)
) {}
