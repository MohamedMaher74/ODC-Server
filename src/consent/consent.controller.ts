import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ConsentService } from './consent.service';
import { ConsentDto } from './dtos/consentDto';

@Controller('consent')
export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  @Get()
  getTermsandConditions() {
    return this.consentService.getConsent();
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  upadateTermsandConditions(@Body() consent: ConsentDto) {
    return this.consentService.updateConsent(consent);
  }
}
