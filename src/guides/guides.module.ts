import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuidesService } from './guides.service';
import { GuidesController } from './guides.controller';
import { Guide } from './entities/guide.entity';
import { UserProgress } from '../user-progress/entities/user-progress.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Guide, UserProgress]),
    AuthModule,
  ],
  controllers: [GuidesController],
  providers: [GuidesService],
  exports: [GuidesService],
})
export class GuidesModule {}