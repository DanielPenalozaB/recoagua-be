import { Test, TestingModule } from "@nestjs/testing";
import { UserBlockResponseService } from "./user-block-response.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserBlockResponse } from "./entities/user-block-response.entity";
import { User } from "../users/entities/user.entity";
import { Block } from "../blocks/entities/block.entity";
import { RelationalPair } from "../blocks/entities/relational-pair.entity";
import { UserAnswerDetails } from "../user-answer-details/entities/user-answer-detail.entity";
import { BlockAnswer } from "../blocks/entities/block-answer.entity";
import { Module } from "../modules/entities/module.entity";
import { UserProgress } from "../user-progress/entities/user-progress.entity";
import { UsersService } from "../users/users.service";
import { BadgesService } from "../badges/badges.service";
import { Repository } from "typeorm";
import { SubmitBlockResponseDto } from "./dto/submit-block-response.dto";
import { QuestionType } from "../blocks/enums/question-type.enum";
import { CompletionStatus } from "../user-progress/enums/completion-status.enum";

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  })),
});

const mockUsersService = {
  addExperience: jest.fn().mockResolvedValue({
    user: { experience: 100 },
    leveledUp: false,
    newLevel: null,
  }),
};

const mockBadgesService = {
  checkAndAwardBadges: jest.fn().mockResolvedValue([]),
};

describe("UserBlockResponseService", () => {
  let service: UserBlockResponseService;
  let blockRepository: Repository<Block>;
  let userBlockResponseRepository: Repository<UserBlockResponse>;
  let userAnswerDetailsRepository: Repository<UserAnswerDetails>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserBlockResponseService,
        {
          provide: getRepositoryToken(UserBlockResponse),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(User), useFactory: mockRepository },
        { provide: getRepositoryToken(Block), useFactory: mockRepository },
        {
          provide: getRepositoryToken(RelationalPair),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(UserAnswerDetails),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(BlockAnswer),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(Module), useFactory: mockRepository },
        {
          provide: getRepositoryToken(UserProgress),
          useFactory: mockRepository,
        },
        { provide: UsersService, useValue: mockUsersService },
        { provide: BadgesService, useValue: mockBadgesService },
      ],
    }).compile();

    service = module.get<UserBlockResponseService>(UserBlockResponseService);
    blockRepository = module.get(getRepositoryToken(Block));
    userBlockResponseRepository = module.get(
      getRepositoryToken(UserBlockResponse),
    );
    userAnswerDetailsRepository = module.get(
      getRepositoryToken(UserAnswerDetails),
    );
  });

  describe("submitResponse", () => {
    const userId = 1;
    const blockId = 100;

    it("should correctly validate MATCHING question with multiple relationalPairIds", async () => {
      // Arrange
      const dto: SubmitBlockResponseDto = {
        blockId,
        relationalPairIds: [10, 11],
      };

      const mockUser = { id: userId };
      const mockBlock = {
        id: blockId,
        questionType: QuestionType.MATCHING,
        points: 10,
        module: { id: 1, guide: { id: 1 } },
        answers: [],
        relationalPairs: [
          { id: 10, correctPair: true },
          { id: 11, correctPair: true },
          { id: 12, correctPair: false },
        ],
      };
      const mockModule = { id: 1, guide: { id: 1 }, blocks: [{ id: blockId }] }; // 1 block

      // Mocks
      (service["userRepository"].findOne as jest.Mock).mockResolvedValue(
        mockUser,
      );
      (blockRepository.findOne as jest.Mock).mockResolvedValue(mockBlock);
      (service["moduleRepository"].findOne as jest.Mock).mockResolvedValue(
        mockModule,
      );

      // Progress mock
      (
        service["userProgressRepository"].findOne as jest.Mock
      ).mockResolvedValue({
        completionStatus: CompletionStatus.IN_PROGRESS,
      });
      (
        service["userBlockResponseRepository"].count as jest.Mock
      ).mockResolvedValue(0);

      // Saved response
      const savedResponse = { id: 999, isCorrect: true };
      (userBlockResponseRepository.create as jest.Mock).mockReturnValue(
        savedResponse,
      );
      (userBlockResponseRepository.save as jest.Mock).mockResolvedValue(
        savedResponse,
      );

      // Distinct count mock
      const countQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ count: "1" }), // 1 answered block
      };
      (
        userBlockResponseRepository.createQueryBuilder as jest.Mock
      ).mockReturnValue(countQueryBuilder);

      // Act
      const result = await service.submitResponse(dto, userId);

      // Assert
      expect(result.isCorrect).toBe(true);
      // Verify saving logic for multiple pairs
      expect(userAnswerDetailsRepository.create).toHaveBeenCalledWith({
        response: savedResponse,
        relationalPair: { id: 10 },
      });
      expect(userAnswerDetailsRepository.create).toHaveBeenCalledWith({
        response: savedResponse,
        relationalPair: { id: 11 },
      });
      expect(userAnswerDetailsRepository.save).toHaveBeenCalledTimes(2); // Should be called for each pair
    });

    it("should correctly validate MATCHING question with string relationalPairIds", async () => {
      // Arrange
      const dto: SubmitBlockResponseDto = {
        blockId,
        relationalPairIds: ["10", "11"] as any,
      };

      const mockUser = { id: userId };
      const mockBlock = {
        id: blockId,
        questionType: QuestionType.MATCHING,
        points: 10,
        module: { id: 1, guide: { id: 1 } },
        answers: [],
        relationalPairs: [
          { id: 10, correctPair: true },
          { id: 11, correctPair: true },
          { id: 12, correctPair: false },
        ],
      };
      const mockModule = { id: 1, guide: { id: 1 }, blocks: [{ id: blockId }] }; // 1 block

      // Mocks
      (service["userRepository"].findOne as jest.Mock).mockResolvedValue(
        mockUser,
      );
      (blockRepository.findOne as jest.Mock).mockResolvedValue(mockBlock);
      (service["moduleRepository"].findOne as jest.Mock).mockResolvedValue(
        mockModule,
      );
      (
        service["userProgressRepository"].findOne as jest.Mock
      ).mockResolvedValue({ completionStatus: CompletionStatus.IN_PROGRESS });
      (
        service["userBlockResponseRepository"].save as jest.Mock
      ).mockResolvedValue({ id: 999 });
      (
        userBlockResponseRepository.createQueryBuilder as jest.Mock
      ).mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ count: "1" }),
      });

      // Act
      const result = await service.submitResponse(dto, userId);

      // Assert
      expect(result.isCorrect).toBe(true);
    });

    it("should fail MATCHING question with partial correct relationalPairIds", async () => {
      const dto: SubmitBlockResponseDto = {
        blockId,
        relationalPairIds: [10], // Missing 11
      };
      const mockUser = { id: userId };
      const mockBlock = {
        id: blockId,
        questionType: QuestionType.MATCHING,
        relationalPairs: [
          { id: 10, correctPair: true },
          { id: 11, correctPair: true },
        ],
        module: { id: 1, guide: { id: 1 } },
      };

      (service["userRepository"].findOne as jest.Mock).mockResolvedValue(
        mockUser,
      );
      (blockRepository.findOne as jest.Mock).mockResolvedValue(mockBlock);
      (service["moduleRepository"].findOne as jest.Mock).mockResolvedValue({
        id: 1,
        guide: { id: 1 },
        blocks: [],
      });
      (
        service["userProgressRepository"].findOne as jest.Mock
      ).mockResolvedValue({});
      (userBlockResponseRepository.create as jest.Mock).mockReturnValue({});
      (userBlockResponseRepository.save as jest.Mock).mockResolvedValue({
        id: 999,
      });

      (
        userBlockResponseRepository.createQueryBuilder as jest.Mock
      ).mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ count: "0" }),
      });

      const result = await service.submitResponse(dto, userId);
      expect(result.isCorrect).toBe(false);
    });

    it("should fail MATCHING question with incorrect relationalPairIds", async () => {
      const dto: SubmitBlockResponseDto = {
        blockId,
        relationalPairIds: [10, 12], // 12 is false
      };
      const mockUser = { id: userId };
      const mockBlock = {
        id: blockId,
        questionType: QuestionType.MATCHING,
        relationalPairs: [
          { id: 10, correctPair: true },
          { id: 11, correctPair: true },
          { id: 12, correctPair: false },
        ],
        module: { id: 1, guide: { id: 1 } },
      };

      (service["userRepository"].findOne as jest.Mock).mockResolvedValue(
        mockUser,
      );
      (blockRepository.findOne as jest.Mock).mockResolvedValue(mockBlock);
      (service["moduleRepository"].findOne as jest.Mock).mockResolvedValue({
        id: 1,
        guide: { id: 1 },
        blocks: [],
      });
      (
        service["userProgressRepository"].findOne as jest.Mock
      ).mockResolvedValue({});
      (userBlockResponseRepository.save as jest.Mock).mockResolvedValue({
        id: 999,
      });
      (
        userBlockResponseRepository.createQueryBuilder as jest.Mock
      ).mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ count: "0" }),
      });

      const result = await service.submitResponse(dto, userId);
      expect(result.isCorrect).toBe(false);
    });
  });
});
