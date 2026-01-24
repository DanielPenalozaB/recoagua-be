import {
  IsInt,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  IsString,
  IsBoolean,
} from "class-validator";

export class SubmitBlockResponseDto {
  @IsInt()
  blockId: number;

  @IsOptional()
  @IsArray()
  selectedAnswerIds?: number[];

  @IsOptional()
  @IsString()
  customAnswer?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  relationalPairIds?: number[];

  @IsOptional()
  @IsInt()
  relationalPairId?: number;

  @IsOptional()
  @IsBoolean()
  resourceViewed?: boolean;
}
