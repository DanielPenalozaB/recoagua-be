import { Module } from '@nestjs/common';
import { UserAnswerDetailsService } from './user-answer-details.service';
import { UserAnswerDetailsController } from './user-answer-details.controller';

@Module({
  controllers: [UserAnswerDetailsController],
  providers: [UserAnswerDetailsService],
})
export class UserAnswerDetailsModule {}
