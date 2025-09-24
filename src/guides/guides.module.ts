import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuidesService } from './guides.service';
import { GuidesController } from './guides.controller';
import { Guide } from './entities/guide.entity';
import { UserProgress } from '../user-progress/entities/user-progress.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Module as ModuleEntity } from '../modules/entities/module.entity';
import { Block } from 'src/blocks/entities/block.entity';
import { BlockAnswer } from 'src/blocks/entities/block-answer.entity';
import { RelationalPair } from 'src/blocks/entities/relational-pair.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Guide,
      UserProgress,
      ModuleEntity,
      Block,
      BlockAnswer,
      RelationalPair
    ]),
    AuthModule,
  ],
  controllers: [GuidesController],
  providers: [GuidesService],
  exports: [GuidesService],
})
export class GuidesModule {}