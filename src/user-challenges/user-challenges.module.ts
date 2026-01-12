import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserChallengesService } from './user-challenges.service';
import { UserChallengesController } from './user-challenges.controller';
import { UserChallenge } from './entities/user-challenge.entity';
import { Challenge } from '../challenges/entities/challenge.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { BadgesModule } from '../badges/badges.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserChallenge, Challenge, User]),
    UsersModule,
    BadgesModule
  ],
  controllers: [UserChallengesController],
  providers: [UserChallengesService],
  exports: [UserChallengesService]
})
export class UserChallengesModule {}
