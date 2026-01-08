import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BlockAnswer } from "src/blocks/entities/block-answer.entity";
import { RelationalPair } from "src/blocks/entities/relational-pair.entity";
import { QuestionType } from "src/blocks/enums/question-type.enum";
import { Module } from "src/modules/entities/module.entity";
import { UserAnswerDetails } from "src/user-answer-details/entities/user-answer-detail.entity";
import { UserProgress } from "src/user-progress/entities/user-progress.entity";
import { CompletionStatus } from "src/user-progress/enums/completion-status.enum";
import { Not, Repository } from "typeorm";
import { Block } from "../blocks/entities/block.entity";
import { User } from "../users/entities/user.entity";
import { SubmitBlockResponseDto } from "./dto/submit-block-response.dto";
import { UserBlockResponse } from "./entities/user-block-response.entity";

@Injectable()
export class UserBlockResponseService {
  constructor(
    @InjectRepository(UserBlockResponse)
    private readonly userBlockResponseRepository: Repository<UserBlockResponse>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Block)
    private readonly blockRepository: Repository<Block>,
    @InjectRepository(RelationalPair)
    private readonly relationalPairRepository: Repository<RelationalPair>,
    @InjectRepository(UserAnswerDetails)
    private readonly userAnswerDetailsRepository: Repository<UserAnswerDetails>,
    @InjectRepository(BlockAnswer)
    private readonly blockAnswerRepository: Repository<BlockAnswer>,
    @InjectRepository(Module)
    private readonly moduleRepository: Repository<Module>,
    @InjectRepository(UserProgress)
    private readonly userProgressRepository: Repository<UserProgress>
  ) {}

  async submitResponse(dto: SubmitBlockResponseDto, userId: number) {
    if (!userId) {
      throw new BadRequestException("User not found in request");
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const block = await this.blockRepository.findOne({
      where: { id: dto.blockId },
      relations: ["module", "module.guide", "answers"],
    });
    if (!block) {
      throw new NotFoundException(`Block ${dto.blockId} not found`);
    }

    // Prevent duplicate responses for same block by same user? Optional. Here we'll allow multiple but prefer upsert:
    // If there is an existing response, we will soft-delete or update; for simplicity we'll create another record.
    // To upsert, lookup and modify existing record instead.

    // Determine correctness
    let isCorrect = false;
    let earnedPoints = 0;

    // Helper: gather correct answer ids (answers with isCorrect true)
    const correctAnswerIds =
      block.answers?.filter((a) => a.isCorrect).map((a) => a.id) || [];

    // Determine by question type
    const qType = block.questionType;

    switch (qType) {
      case QuestionType.MULTIPLE_CHOICE:
        if (!dto.selectedAnswerIds || dto.selectedAnswerIds.length === 0) {
          isCorrect = false;
          break;
        }

        const selected = new Set(dto.selectedAnswerIds);
        const correct = new Set(correctAnswerIds);

        // Deben coincidir exactamente
        if (selected.size !== correct.size) {
          isCorrect = false;
        } else {
          isCorrect = [...correct].every((id) => selected.has(id));
        }
        break;

      case QuestionType.TRUE_FALSE:
        if (!dto.selectedAnswerIds || dto.selectedAnswerIds.length !== 1) {
          isCorrect = false;
          break;
        }
        const selectedId = dto.selectedAnswerIds[0];
        isCorrect = correctAnswerIds.includes(selectedId);
        break;

      case QuestionType.OPEN_ENDED:
        // Nunca se marca automáticamente como correcto
        isCorrect = false;
        break;

      case QuestionType.MATCHING:
        // dto.relationalPairId debe existir para validar
        if (!dto.relationalPairId) {
          isCorrect = false;
          break;
        }

        // Aquí asumimos que BlockAnswer tiene una relación con RelationalPair
        // Si tu estructura es diferente, la ajusto con tu modelo real
        const pair = await this.relationalPairRepository.findOne({
          where: { id: dto.relationalPairId },
        });

        if (!pair) {
          isCorrect = false;
        } else {
          isCorrect = pair.correctPair ?? false;
        }
        break;

      case QuestionType.ORDERING:
        // dto.selectedAnswerIds representarán el orden enviado
        if (!dto.selectedAnswerIds || dto.selectedAnswerIds.length === 0) {
          isCorrect = false;
          break;
        }

        // Obtener respuestas del bloque con orden correcto
        const orderedAnswers = block.answers.sort((a, b) => a.order - b.order);
        const correctOrder = orderedAnswers.map((a) => a.id);

        const submittedOrder = dto.selectedAnswerIds;

        // Deben coincidir en orden exacto
        isCorrect =
          submittedOrder.length === correctOrder.length &&
          submittedOrder.every((id, i) => id === correctOrder[i]);
        break;

      default:
        isCorrect = false;
    }

    if (isCorrect) {
      earnedPoints = block.points || 0;
    }

    // Create user response record
    const response = this.userBlockResponseRepository.create({
      user,
      block,
      isCorrect,
      submittedAt: new Date(),
    });

    const savedResponse = await this.userBlockResponseRepository.save(response);

    // For selectedAnswerIds: save one UserAnswerDetails per answer
    if (dto.selectedAnswerIds && dto.selectedAnswerIds.length > 0) {
      for (const answerId of dto.selectedAnswerIds) {
        const answer = await this.blockAnswerRepository.findOne({
          where: { id: answerId },
        });
        if (!answer) {
          // ignore unknown answer ids or throw; we'll ignore to be tolerant
          continue;
        }
        const detail = this.userAnswerDetailsRepository.create({
          response: savedResponse,
          answer,
        });
        await this.userAnswerDetailsRepository.save(detail);
      }
    } else if (dto.customAnswer) {
      const detail = this.userAnswerDetailsRepository.create({
        response: savedResponse,
        customAnswer: dto.customAnswer,
      });
      await this.userAnswerDetailsRepository.save(detail);
    } else if (dto.relationalPairId) {
      // If you have relationalPair entity, save it here by looking it up and mapping to UserAnswerDetails.relationalPair
      const detail = this.userAnswerDetailsRepository.create({
        response: savedResponse,
        relationalPair: { id: dto.relationalPairId } as any, // if relation exists
      });
      await this.userAnswerDetailsRepository.save(detail);
    }

    // Update or create user progress for this module & guide
    const module = await this.moduleRepository.findOne({
      where: { id: block.module.id },
      relations: ["blocks", "guide"],
    });
    if (!module) {
      // unexpected; module should exist
      throw new NotFoundException("Module for block not found");
    }

    // upsert progress record for this user-guide-module
    let progress = await this.userProgressRepository.findOne({
      where: {
        user: { id: userId },
        module: { id: module.id },
        guide: { id: module.guide.id },
      },
      relations: ["module", "guide", "user"],
    });

    progress ??= this.userProgressRepository.create({
      user,
      guide: module.guide,
      module,
      completionStatus: CompletionStatus.IN_PROGRESS,
      earnedPoints: 0,
    });

    // Add earned points only if not already awarded for this block
    // prevent double awarding: check if user already has a response for this block that isCorrect
    const priorCorrectResponses = await this.userBlockResponseRepository.count({
      where: {
        user: { id: userId },
        block: { id: block.id },
        isCorrect: true,
        id: Not(savedResponse.id), // Import 'Not' from typeorm
      },
    });

    if (isCorrect && priorCorrectResponses === 0) {
      // Use coercion to ensure we are working with numbers
      const currentPoints = Number(progress.earnedPoints) || 0;
      const newBlockPoints = Number(block.points) || 0;

      progress.earnedPoints = currentPoints + newBlockPoints;
    }

    // Determine completion: if number of distinct blocks answered by user for this module equals module.blocks.length -> completed
    // Count distinct responses for this user for blocks of this module
    const blocksInModule = module.blocks || [];
    const totalBlocks = blocksInModule.length;

    const answeredDistinct = await this.userBlockResponseRepository
      .createQueryBuilder("resp")
      .leftJoin("resp.block", "block")
      .where("resp.userId = :userId", { userId })
      .andWhere("block.moduleId = :moduleId", { moduleId: module.id })
      .select("COUNT(DISTINCT block.id)", "count")
      .getRawOne();

    const answeredCount = parseInt(answeredDistinct.count || "0", 10);

    if (totalBlocks > 0 && answeredCount >= totalBlocks) {
      progress.completionStatus = CompletionStatus.COMPLETED;
      progress.completedAt = new Date();
      progress.earnedPoints = module.points;
    } else {
      progress.completionStatus = CompletionStatus.IN_PROGRESS;
    }

    await this.userProgressRepository.save(progress);

    return {
      id: savedResponse.id,
      blockId: block.id,
      isCorrect,
      earnedPoints,
      submittedAt: savedResponse.submittedAt,
      progress: {
        id: progress.id,
        completionStatus: progress.completionStatus,
        earnedPoints: progress.earnedPoints,
        completedAt: progress.completedAt,
      },
    };
  }

  async findAll(
    userId?: number,
    blockId?: number
  ): Promise<UserBlockResponse[]> {
    const queryBuilder = this.userBlockResponseRepository
      .createQueryBuilder("response")
      .leftJoinAndSelect("response.user", "user")
      .leftJoinAndSelect("response.block", "block")
      .leftJoinAndSelect("response.answerDetails", "details")
      .orderBy("response.submittedAt", "DESC");

    if (userId) {
      queryBuilder.andWhere("user.id = :userId", { userId });
    }

    if (blockId) {
      queryBuilder.andWhere("block.id = :blockId", { blockId });
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: number): Promise<UserBlockResponse> {
    const response = await this.userBlockResponseRepository
      .createQueryBuilder("response")
      .leftJoinAndSelect("response.user", "user")
      .leftJoinAndSelect("response.block", "block")
      .leftJoinAndSelect("response.answerDetails", "details")
      .where("response.id = :id", { id })
      .getOne();

    if (!response) {
      throw new NotFoundException(
        `User block response with ID ${id} not found`
      );
    }

    return response;
  }

  async findByUserAndBlock(
    userId: number,
    blockId: number
  ): Promise<UserBlockResponse | null> {
    return await this.userBlockResponseRepository
      .createQueryBuilder("response")
      .leftJoinAndSelect("response.user", "user")
      .leftJoinAndSelect("response.block", "block")
      .leftJoinAndSelect("response.answerDetails", "details")
      .where("user.id = :userId", { userId })
      .andWhere("block.id = :blockId", { blockId })
      .getOne();
  }

  async getUserBlockStats(userId: number) {
    const totalResponses = await this.userBlockResponseRepository.count({
      where: { user: { id: userId } },
    });

    const correctResponses = await this.userBlockResponseRepository.count({
      where: {
        user: { id: userId },
        isCorrect: true,
      },
    });

    return {
      totalResponses,
      correctResponses,
      incorrectResponses: totalResponses - correctResponses,
      accuracyRate:
        totalResponses > 0 ? (correctResponses / totalResponses) * 100 : 0,
    };
  }

  async getBlockStats(blockId: number) {
    const totalResponses = await this.userBlockResponseRepository.count({
      where: { block: { id: blockId } },
    });

    const correctResponses = await this.userBlockResponseRepository.count({
      where: {
        block: { id: blockId },
        isCorrect: true,
      },
    });

    const uniqueUsers = await this.userBlockResponseRepository
      .createQueryBuilder("response")
      .select("COUNT(DISTINCT response.user.id)", "count")
      .where("response.block.id = :blockId", { blockId })
      .getRawOne();

    return {
      totalResponses,
      correctResponses,
      incorrectResponses: totalResponses - correctResponses,
      accuracyRate:
        totalResponses > 0 ? (correctResponses / totalResponses) * 100 : 0,
      uniqueUsers: parseInt(uniqueUsers?.count || "0"),
    };
  }
}
