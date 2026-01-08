import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserBlockResponseService } from "./user-block-response.service";
import { UserBlockResponseController } from "./user-block-response.controller";
import { UserBlockResponse } from "./entities/user-block-response.entity";
import { User } from "../users/entities/user.entity";
import { Block } from "../blocks/entities/block.entity";
import { UserAnswerDetails } from "src/user-answer-details/entities/user-answer-detail.entity";
import { RelationalPair } from "src/blocks/entities/relational-pair.entity";
import { BlockAnswer } from "src/blocks/entities/block-answer.entity";
import { Module as ModuleEntity } from "src/modules/entities/module.entity";
import { UserProgress } from "src/user-progress/entities/user-progress.entity";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserBlockResponse,
      User,
      Block,
      RelationalPair,
      UserAnswerDetails,
      BlockAnswer,
      ModuleEntity,
      UserProgress,
    ]),
    AuthModule,
  ],
  controllers: [UserBlockResponseController],
  providers: [UserBlockResponseService],
  exports: [UserBlockResponseService],
})
export class UserBlockResponseModule {}
