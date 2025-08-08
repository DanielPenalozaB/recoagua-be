import { Module } from '@nestjs/common';
import { UserChallengesService } from './user-challenges.service';
import { UserChallengesController } from './user-challenges.controller';

@Module({
  controllers: [UserChallengesController],
  providers: [UserChallengesService],
})
export class UserChallengesModule {}
