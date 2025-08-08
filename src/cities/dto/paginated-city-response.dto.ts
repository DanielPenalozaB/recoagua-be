import { ApiProperty } from '@nestjs/swagger';
import { CityResponseDto } from './city-response.dto';

export class PaginatedCityResponseDto {
  @ApiProperty({ type: [CityResponseDto] })
  data: CityResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  hasNextPage: boolean;
}