import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Body,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MyMulter } from 'src/helpers/multer/multer';
import { OnBoardingService } from './onboarding.service';
import { OnBoardingDto } from './dtos/create-onboarding';
import { ApiOperation } from '@nestjs/swagger';

export const storage = {
  storage: MyMulter.Storage('./src/client/uploads/onboarding'),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == 'image/png' ||
      file.mimetype == 'image/jpg' ||
      file.mimetype == 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new BadRequestException('Only .png, .jpg and .jpeg format allowed!'));
    }
  },
};

@Controller('onboarding')
export class OnBoardingController {
  constructor(private readonly onboardingService: OnBoardingService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', storage))
  async addOnboarding(
    @Body() onboardingDto: OnBoardingDto,
    @UploadedFile() file: any,
  ) {
    try {
      if (!file) {
        return new BadRequestException('please provide an image');
      }
      return this.onboardingService.addOnBoarding(onboardingDto, file);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @ApiOperation({
    summary: 'return th the user password',
  })
  async getOnBoarding() {
    return this.onboardingService.getOnBoarding();
  }
}
