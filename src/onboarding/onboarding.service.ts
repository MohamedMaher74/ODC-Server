import { Injectable } from '@nestjs/common';
import { OnBoardingDto } from './dtos/create-onboarding';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OnBoardingService {
  constructor(private readonly prismaService: PrismaService) {}

  async addOnBoarding(onboardingDto: OnBoardingDto, file: any) {
    try {
      const path = file.path.split('src\\').join('');
      const onboarding = await this.prismaService.onBoarding.create({
        data: {
          ...onboardingDto,
          imageUrl: path,
        },
      });
      return onboarding;
    } catch (error) {
      throw error;
    }
  }

  async getOnBoarding() {
    return await this.prismaService.onBoarding.findMany();
  }
}
