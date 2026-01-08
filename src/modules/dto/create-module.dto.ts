import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  MinLength,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ModuleStatus } from "../enums/module-status.enum";

export class CreateModuleDto2 {
  @ApiProperty({ example: "Understanding Water Cycle" })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: "Learn about the water cycle process" })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: 1, description: "Order within the guide" })
  @IsNumber()
  @Min(1)
  order: number;

  @ApiProperty({ example: 25, description: "Points for this module" })
  @IsNumber()
  @Min(0)
  points: number;

  @ApiProperty({ enum: ModuleStatus, required: false })
  @IsEnum(ModuleStatus)
  @IsOptional()
  status?: ModuleStatus = ModuleStatus.DRAFT;

  @ApiProperty({ example: 1, description: "Guide ID" })
  @IsNumber()
  guideId: number;
}
