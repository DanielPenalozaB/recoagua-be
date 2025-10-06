import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { Status } from 'src/common/enums/status.enum';

export class CreateBadgeDto {
  @ApiProperty({
    example: 'Water Hero',
    description: 'The name of the badge'
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Awarded for exceptional water conservation efforts',
    description: 'Description of the badge',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'https://example.com/badges/water-hero.png',
    description: 'URL to badge image',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({
    example: 'Complete 5 water conservation guides',
    description: 'Requirements to earn this badge',
  })
  @IsNotEmpty()
  @IsString()
  requirements: string;

  @ApiProperty({
    enum: Status,
    description: 'Status of the badge',
    required: false,
  })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
}