import { Module } from '@nestjs/common';
import { OnBoardingController } from './onboarding.controller';
import { OnBoardingService } from './onboarding.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [OnBoardingController],
  providers: [OnBoardingService, PrismaService]
})
export class OnBoardingModule { }
