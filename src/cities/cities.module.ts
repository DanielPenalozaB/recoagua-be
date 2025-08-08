import { Module } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from './entities/city.entity';
import { Region } from 'src/regions/entities/region.entity';
import { RegionsModule } from 'src/regions/regions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      City,
      Region
    ]),
    RegionsModule
  ],
  controllers: [CitiesController],
  providers: [CitiesService],
  exports: [CitiesService],
})
export class CitiesModule {}
