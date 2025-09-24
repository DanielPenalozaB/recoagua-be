import { IsString, IsEnum, IsNumber, IsOptional, MinLength, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { GuideDifficulty } from '../enums/guide-difficulty.enum';
import { GuideStatus } from '../enums/guide-status.enum';
import { CreateModuleDto } from './create-module.dto';

export class CreateGuideDto {
  @ApiProperty({ example: 'Water Conservation Basics' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: 'Learn the basics of water conservation' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ enum: GuideDifficulty })
  @IsEnum(GuideDifficulty)
  difficulty: GuideDifficulty;

  @ApiProperty({ example: 60, description: 'Estimated duration in minutes' })
  @IsNumber()
  @Min(1)
  estimatedDuration: number;

  @ApiProperty({ enum: GuideStatus, required: false })
  @IsEnum(GuideStatus)
  @IsOptional()
  status?: GuideStatus = GuideStatus.DRAFT;

  @ApiProperty({ example: 'en', description: 'Language code' })
  @IsString()
  @MinLength(2)
  language: string;

  @ApiProperty({ example: 100, description: 'Total points achievable' })
  @IsNumber()
  @Min(0)
  totalPoints: number;

  @ApiProperty({ type: [CreateModuleDto], description: 'Modules contained in this guide', required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateModuleDto)
  @IsOptional()
  modules?: CreateModuleDto[];
}