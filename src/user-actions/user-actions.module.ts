import { Module } from '@nestjs/common';
import { UserActionsService } from './user-actions.service';
import { UserActionsController } from './user-actions.controller';

@Module({
  controllers: [UserActionsController],
  providers: [UserActionsService],
})
export class UserActionsModule {}
