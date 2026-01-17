import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { User } from "../users/entities/user.entity";
import { Guide } from "../guides/entities/guide.entity";
import { Challenge } from "../challenges/entities/challenge.entity";
import { UserProgress } from "../user-progress/entities/user-progress.entity";
import { UserChallenge } from "../user-challenges/entities/user-challenge.entity";
import { Badge } from "../badges/entities/badge.entity";
import { UserBadge } from "../user-progress/entities/user-badge.entity";
import { City } from "../cities/entities/city.entity";
import { UserAction } from "../user-actions/entities/user-action.entity";
import { UserBlockResponse } from "../user-block-response/entities/user-block-response.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Guide,
      Challenge,
      UserProgress,
      UserChallenge,
      Badge,
      UserBadge,
      City,
      UserAction,
      UserBlockResponse,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
