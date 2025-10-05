import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';
import { CreateLevelDto } from './create-level.dto';

export class BulkCreateLevelDto {
  @ApiProperty({
    type: [CreateLevelDto],
    description: 'Array of levels to create',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLevelDto)
  levels: CreateLevelDto[];
}