import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserBlockResponseService } from './user-block-response.service';
import { UserBlockResponseController } from './user-block-response.controller';
import { UserBlockResponse } from './entities/user-block-response.entity';
import { User } from '../users/entities/user.entity';
import { Block } from '../blocks/entities/block.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserBlockResponse, User, Block])],
  controllers: [UserBlockResponseController],
  providers: [UserBlockResponseService],
  exports: [UserBlockResponseService],
})
export class UserBlockResponseModule {}