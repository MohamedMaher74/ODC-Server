import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { TermsAndConditionsDto } from './dtos/T&CDto';
import { TermsAndConditionsService } from './terms-and-conditions.service';

@Controller('terms-and-conditions')
export class TermsAndConditionsController {
  constructor(private readonly tcServices: TermsAndConditionsService) {}

  @Get()
  getTermsandConditions() {
    return this.tcServices.getTermsAndConditions();
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  upadateTermsandConditions(@Body() terms_conditions: TermsAndConditionsDto) {
    return this.tcServices.updateTermsAndConditions(terms_conditions);
  }
}
