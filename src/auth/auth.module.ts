import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AccessTokenStrategy, RefreshTokenStrategy } from './strategy';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from 'src/email/email.service';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [AuthController],
  imports: [JwtModule.register({}), ConfigModule.forRoot()],
  providers: [
    UserService,
    PrismaService,
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    EmailService,
  ],
})
export class AuthModule {}
