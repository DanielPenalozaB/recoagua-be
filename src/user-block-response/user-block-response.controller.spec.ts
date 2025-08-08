import { Test, TestingModule } from '@nestjs/testing';
import { UserBlockResponseController } from './user-block-response.controller';
import { UserBlockResponseService } from './user-block-response.service';

describe('UserBlockResponseController', () => {
  let controller: UserBlockResponseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserBlockResponseController],
      providers: [UserBlockResponseService],
    }).compile();

    controller = module.get<UserBlockResponseController>(UserBlockResponseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
