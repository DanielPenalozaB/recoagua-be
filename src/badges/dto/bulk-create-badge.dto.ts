import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';
import { CreateBadgeDto } from './create-badge.dto';

export class BulkCreateBadgeDto {
  @ApiProperty({
    type: [CreateBadgeDto],
    description: 'Array of badges to create',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBadgeDto)
  badges: CreateBadgeDto[];
}