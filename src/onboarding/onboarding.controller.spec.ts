import { Test, TestingModule } from '@nestjs/testing';
import { OnBoardingController } from './onboarding.controller';

describe('OnBoardingController', () => {
  let controller: OnBoardingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnBoardingController],
    }).compile();

    controller = module.get<OnBoardingController>(OnBoardingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
