import { Test, TestingModule } from '@nestjs/testing';
import { UserBlockResponseService } from './user-block-response.service';

describe('UserBlockResponseService', () => {
  let service: UserBlockResponseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserBlockResponseService],
    }).compile();

    service = module.get<UserBlockResponseService>(UserBlockResponseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
