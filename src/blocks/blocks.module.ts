import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlocksService } from './blocks.service';
import { BlocksController } from './blocks.controller';
import { Block } from './entities/block.entity';
import { BlockAnswer } from './entities/block-answer.entity';
import { RelationalPair } from './entities/relational-pair.entity';
import { Module as ModuleEntity } from '../modules/entities/module.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Block, BlockAnswer, RelationalPair, ModuleEntity]),
    AuthModule
  ],
  controllers: [BlocksController],
  providers: [BlocksService],
  exports: [BlocksService],
})
export class BlocksModule {}