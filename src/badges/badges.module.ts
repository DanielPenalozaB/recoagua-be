import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgesController } from './badges.controller';
import { BadgesService } from './badges.service';
import { Badge } from './entities/badge.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserBadge } from 'src/user-progress/entities/user-badge.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Badge, UserBadge]),
    AuthModule
  ],
  controllers: [BadgesController],
  providers: [BadgesService],
  exports: [BadgesService],
})
export class BadgesModule {}