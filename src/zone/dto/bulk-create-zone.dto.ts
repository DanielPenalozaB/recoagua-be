import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateZoneDto } from './create-zone.dto';

export class BulkCreateZoneDto {
  @ApiProperty({
    type: [CreateZoneDto],
    description: 'Array of zones to create',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateZoneDto)
  zones: CreateZoneDto[];
}