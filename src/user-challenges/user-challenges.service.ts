import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserChallengeDto } from "./dto/create-user-challenge.dto";
import { UpdateUserChallengeDto } from "./dto/update-user-challenge.dto";
import { UserChallenge } from "./entities/user-challenge.entity";
import { Challenge } from "../challenges/entities/challenge.entity";
import { UsersService } from "../users/users.service";
import { BadgesService } from "../badges/badges.service";
import { ChallengeCompletionStatus } from "./enums/challenge-completion-status.enum";
import { BadgeTriggerType } from "../badges/enums/badge-trigger-type.enum";

@Injectable()
export class UserChallengesService {
  constructor(
    @InjectRepository(UserChallenge)
    private readonly userChallengeRepository: Repository<UserChallenge>,
    @InjectRepository(Challenge)
    private readonly challengeRepository: Repository<Challenge>,
    private readonly usersService: UsersService,
    private readonly badgesService: BadgesService,
  ) {}

  async create(userId: number, createUserChallengeDto: CreateUserChallengeDto) {
    const challenge = await this.challengeRepository.findOne({
      where: { id: createUserChallengeDto.challengeId },
    });
    if (!challenge) throw new NotFoundException("Challenge not found");

    const existing = await this.userChallengeRepository.findOne({
      where: {
        user: { id: userId },
        challenge: { id: createUserChallengeDto.challengeId },
      },
    });

    if (existing)
      throw new BadRequestException("User challenge already exists");

    const userChallenge = this.userChallengeRepository.create({
      user: { id: userId } as any,
      challenge,
      completionStatus: ChallengeCompletionStatus.IN_PROGRESS,
    });

    return await this.userChallengeRepository.save(userChallenge);
  }

  async findAll(userId: number) {
    return await this.userChallengeRepository.find({
      where: { user: { id: userId } },
      relations: ["challenge"],
    });
  }

  async findOne(id: number) {
    const challenge = await this.userChallengeRepository.findOne({
      where: { id },
      relations: ["challenge", "user"],
    });
    if (!challenge) throw new NotFoundException("User challenge not found");
    return challenge;
  }

  async completeChallenge(userId: number, challengeId: number) {
    let userChallenge = await this.userChallengeRepository.findOne({
      where: { user: { id: userId }, challenge: { id: challengeId } },
      relations: ["challenge"],
    });

    if (!userChallenge) {
      // Option: Auto-start if completing directly?
      // Let's create it.
      const challenge = await this.challengeRepository.findOne({
        where: { id: challengeId },
      });
      if (!challenge) throw new NotFoundException("Challenge not found");

      userChallenge = this.userChallengeRepository.create({
        user: { id: userId } as any,
        challenge,
        completionStatus: ChallengeCompletionStatus.IN_PROGRESS,
      });
    }

    if (
      userChallenge.completionStatus === ChallengeCompletionStatus.COMPLETED
    ) {
      return {
        id: userChallenge.id,
        completionStatus: userChallenge.completionStatus,
        xpAwarded: 0,
        leveledUp: false,
        newLevel: null,
        awardedBadges: [],
      };
    }

    userChallenge.completionStatus = ChallengeCompletionStatus.COMPLETED;
    userChallenge.completedAt = new Date();
    userChallenge.earnedPoints = userChallenge.challenge.score;

    await this.userChallengeRepository.save(userChallenge);

    // Award XP
    const xpResult = await this.usersService.addExperience(
      userId,
      userChallenge.earnedPoints,
    );

    // Check Badges
    const pointBadges = await this.badgesService.checkAndAwardBadges(
      userId,
      BadgeTriggerType.POINTS,
      xpResult.user.experience,
    );

    const completedCount = await this.userChallengeRepository.count({
      where: {
        user: { id: userId },
        completionStatus: ChallengeCompletionStatus.COMPLETED,
      },
    });
    const challengeBadges = await this.badgesService.checkAndAwardBadges(
      userId,
      BadgeTriggerType.CHALLENGES_COMPLETED,
      completedCount,
    );

    const awardedBadges = [...pointBadges, ...challengeBadges];

    return {
      id: userChallenge.id,
      completionStatus: userChallenge.completionStatus,
      xpAwarded: userChallenge.earnedPoints,
      leveledUp: xpResult.leveledUp,
      newLevel: xpResult.newLevel,
      awardedBadges: awardedBadges,
    };
  }

  // Placeholder for standard update if needed, but completeChallenge is specialized
  update(id: number, updateUserChallengeDto: UpdateUserChallengeDto) {
    return `This action updates a #${id} userChallenge`;
  }

  remove(id: number) {
    return `This action removes a #${id} userChallenge`;
  }
}
