import { Module } from '@nestjs/common';
import { TermsAndConditionsService } from './terms-and-conditions.service';
import { TermsAndConditionsController } from './terms-and-conditions.controller';

@Module({
  providers: [TermsAndConditionsService],
  controllers: [TermsAndConditionsController]
})
export class TermsAndConditionsModule {}
