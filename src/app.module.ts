import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { EmailService } from './email/email.service';
import { TermsAndConditionsModule } from './terms-and-conditions/terms-and-conditions.module';
import { UserModule } from './user/user.module';
import { OnBoardingModule } from './onboarding/onboarding.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConsentModule } from './consent/consent.module';
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '.', 'client'),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    TermsAndConditionsModule,
    UserModule,
    OnBoardingModule,
    ConsentModule,
  ],
  controllers: [AppController],
  providers: [AppService, EmailService],
})
export class AppModule {}
