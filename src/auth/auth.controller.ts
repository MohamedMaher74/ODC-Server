import {
  Controller,
  Body,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { ForgetPasswordDto } from './dtos/forget.dto';
import { AccessTokenGuard, RefreshTokenGuard } from './guards';
import { GetCurrentUser } from './decorators';
import { ConfirmCodeDto } from './dtos/confirmcode.dto';
import { ResetPasswordDto } from './dtos/resetpassword.dto';
import { ApiOperation } from '@nestjs/swagger';
import { error } from 'console';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Creates a user and returns access and refresh tokens',
  })
  signUp(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logs a user in and returns access and refresh tokens',
  })
  signin(@Body() loginDto: LoginDto) {
    try {
      return this.authService.login(loginDto);
    } catch (err) {
      return error;
    }
  }

  @Post('forgetpassword')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'sends and otp to the provided email (if exists)',
  })
  forgetPassword(@Body() forgetPassword: ForgetPasswordDto) {
    return this.authService.forgetPassword(forgetPassword);
  }

  @Post('confirmcode')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'confirms the otp code, provides a token',
  })
  confirmCode(@Body() confirmCodeDto: ConfirmCodeDto) {
    return this.authService.confirmCode(confirmCodeDto);
  }

  @Post('resetpassword')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'reset the user password',
    description: 'requires the token sent by the confirm code',
  })
  resetPassword(@Body() resetPassword: ResetPasswordDto) {
    return this.authService.resetPassword(resetPassword);
  }

  @UseGuards(AccessTokenGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'send new access and refresh tokens',
  })
  refreshTokens(
    @GetCurrentUser('id') userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
