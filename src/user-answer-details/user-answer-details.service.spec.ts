import { Test, TestingModule } from '@nestjs/testing';
import { UserAnswerDetailsService } from './user-answer-details.service';

describe('UserAnswerDetailsService', () => {
  let service: UserAnswerDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserAnswerDetailsService],
    }).compile();

    service = module.get<UserAnswerDetailsService>(UserAnswerDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
