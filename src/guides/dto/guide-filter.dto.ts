import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { GuideStatus } from "../enums/guide-status.enum";

export class GuideFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: "Search by name",
    example: "Water basics",
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;

  @ApiPropertyOptional({
    description: "Filter by status",
    example: GuideStatus.PUBLISHED,
    enum: GuideStatus,
  })
  @IsOptional()
  @IsEnum(GuideStatus)
  status?: GuideStatus;

  @ApiPropertyOptional({
    description: "Filter by guide status",
  })
  @IsOptional()
  @IsBoolean()
  hideCompleted?: boolean;
}
