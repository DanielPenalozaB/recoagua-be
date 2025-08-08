import { Test, TestingModule } from '@nestjs/testing';
import { UserAnswerDetailsController } from './user-answer-details.controller';
import { UserAnswerDetailsService } from './user-answer-details.service';

describe('UserAnswerDetailsController', () => {
  let controller: UserAnswerDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserAnswerDetailsController],
      providers: [UserAnswerDetailsService],
    }).compile();

    controller = module.get<UserAnswerDetailsController>(UserAnswerDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
