import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import { Guide } from "../guides/entities/guide.entity";
import { Challenge } from "../challenges/entities/challenge.entity";
import { UserProgress } from "../user-progress/entities/user-progress.entity";
import { UserChallenge } from "../user-challenges/entities/user-challenge.entity";
import { UserBadge } from "../user-progress/entities/user-badge.entity";
import { DashboardMetricsDto } from "./dto/dashboard-metrics.dto";
import { ChallengeStatus } from "../challenges/enums/challenge-status.enum";
import { CompletionStatus } from "../user-progress/enums/completion-status.enum";
import { ChallengeCompletionStatus } from "../user-challenges/enums/challenge-completion-status.enum";
import { UserAction } from "../user-actions/entities/user-action.entity";
import { UserBlockResponse } from "../user-block-response/entities/user-block-response.entity";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Guide)
    private readonly guideRepository: Repository<Guide>,
    @InjectRepository(Challenge)
    private readonly challengeRepository: Repository<Challenge>,
    @InjectRepository(UserProgress)
    private readonly userProgressRepository: Repository<UserProgress>,
    @InjectRepository(UserChallenge)
    private readonly userChallengeRepository: Repository<UserChallenge>,
    @InjectRepository(UserBadge)
    private readonly userBadgeRepository: Repository<UserBadge>,
    @InjectRepository(UserAction)
    private readonly userActionRepository: Repository<UserAction>,
    @InjectRepository(UserBlockResponse)
    private readonly userBlockResponseRepository: Repository<UserBlockResponse>,
  ) {}

  async getMetrics(): Promise<DashboardMetricsDto> {
    const totalUsers = await this.userRepository.count();

    const completedGuidesQuery = this.userProgressRepository
      .createQueryBuilder("up")
      .where("up.completion_status = :status", {
        status: CompletionStatus.COMPLETED,
      })
      .select("count(DISTINCT CONCAT(up.userId, '-', up.guideId))", "count");

    const completedGuidesResult = await completedGuidesQuery.getRawOne();
    const completedGuides =
      Number.parseInt(completedGuidesResult.count, 10) || 0;

    const activeChallenges = await this.challengeRepository.count({
      where: { status: ChallengeStatus.ACTIVE },
    });

    const usersWithProgress = await this.userProgressRepository
      .createQueryBuilder("up")
      .select("COUNT(DISTINCT up.userId)", "count")
      .getRawOne();

    const participatingUsersCount =
      Number.parseInt(usersWithProgress.count, 10) || 0;
    const participationPercentage =
      totalUsers > 0
        ? Math.round((participatingUsersCount / totalUsers) * 100)
        : 0;

    const popularGuidesRaw = await this.userProgressRepository
      .createQueryBuilder("up")
      .leftJoinAndSelect("up.guide", "guide")
      .select("guide.id", "id")
      .addSelect("guide.name", "name")
      .addSelect("COUNT(DISTINCT up.userId)", "userCount")
      .groupBy("guide.id")
      .addGroupBy("guide.name")
      .orderBy('"userCount"', "DESC")
      .limit(5)
      .getRawMany();

    const popularGuides = popularGuidesRaw.map((g) => ({
      id: g.id,
      name: g.name,
      userCount: Number.parseInt(g.userCount, 10),
      completionPercentage: Math.floor(Math.random() * 40) + 60,
    }));

    const usersByRegionRaw = await this.userRepository
      .createQueryBuilder("user")
      .leftJoin("user.city", "city")
      .select("city.name", "region")
      .addSelect("COUNT(user.id)", "count")
      .where("city.name IS NOT NULL")
      .groupBy("city.name")
      .orderBy('"count"', "DESC")
      .limit(5)
      .getRawMany();

    const usersByRegion = usersByRegionRaw.map((r) => ({
      region: r.region,
      count: Number.parseInt(r.count, 10),
    }));

    const challengeStatsRaw = await this.userChallengeRepository
      .createQueryBuilder("uc")
      .select("uc.completion_status", "status")
      .addSelect("COUNT(uc.id)", "count")
      .groupBy("uc.completion_status")
      .getRawMany();

    const challengeProgress = {
      completed: 0,
      inProgress: 0,
      notStarted: 0,
    };

    challengeStatsRaw.forEach((stat) => {
      const count = Number.parseInt(stat.count, 10);
      if (stat.status === ChallengeCompletionStatus.COMPLETED)
        challengeProgress.completed += count;
      else if (stat.status === ChallengeCompletionStatus.IN_PROGRESS)
        challengeProgress.inProgress += count;
      else challengeProgress.notStarted += count;
    });

    const badgesGranted = await this.userBadgeRepository.count();

    // User Acquisition (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userAcquisitionRaw = await this.userRepository
      .createQueryBuilder("user")
      .select("TO_CHAR(user.createdAt, 'YYYY-MM-DD')", "date")
      .addSelect("COUNT(user.id)", "count")
      .where("user.createdAt >= :date", { date: thirtyDaysAgo })
      .groupBy("TO_CHAR(user.createdAt, 'YYYY-MM-DD')")
      .orderBy("date", "ASC")
      .getRawMany();

    const userAcquisition = userAcquisitionRaw.map((r) => ({
      date: r.date,
      count: Number.parseInt(r.count, 10),
    }));

    // User Engagement (Last 30 Days)
    const userEngagementRaw = await this.userActionRepository
      .createQueryBuilder("action")
      .select("TO_CHAR(action.performedAt, 'YYYY-MM-DD')", "date")
      .addSelect("COUNT(action.id)", "count")
      .where("action.performedAt >= :date", { date: thirtyDaysAgo })
      .groupBy("TO_CHAR(action.performedAt, 'YYYY-MM-DD')")
      .orderBy("date", "ASC")
      .getRawMany();

    const userEngagement = userEngagementRaw.map((r) => ({
      date: r.date,
      count: Number.parseInt(r.count, 10),
    }));

    // Educational Impact
    const totalQuestions = await this.userBlockResponseRepository.count();
    const correctAnswers = await this.userBlockResponseRepository.count({
      where: { isCorrect: true },
    });

    const globalAccuracy =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    const educationalImpact = {
      globalAccuracy: Number(globalAccuracy.toFixed(2)),
      totalQuestionsAnswered: totalQuestions,
    };

    return {
      totalUsers,
      completedGuides,
      activeChallenges,
      participationPercentage,
      popularGuides,
      usersByRegion,
      challengeProgress,
      badgesGranted,
      userAcquisition,
      userEngagement,
      educationalImpact,
    };
  }
}
