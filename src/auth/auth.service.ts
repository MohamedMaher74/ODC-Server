import {
  Injectable,
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Tokens } from './tokens.types';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UserService } from 'src/user/user.service';
import { FileSystemHelper } from 'src/helpers/file-system/filesystem';

interface SignupParams {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  passwordConfirm: string;
  nationalId: string;
}

interface LoginParams {
  email: string;
  password: string;
}

interface ForgetParams {
  email: string;
}

interface ConfirmParams {
  code: string;
}

interface ResetParams {
  newPassword: string;
  newPasswordConfirm: string;
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private emailService: EmailService,
  ) { }

  passwordMatches(password: string, confirmPassword: string) {
    if (password !== confirmPassword) {
      throw new HttpException(
        'Passwords does not match!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async checkExistingUser(nationalId: string, email: string) {
    try {
      const condition = {
        OR: [{ nationalId }, { email }],
      };

      const userExists = await this.userService.findOne(condition);

      if (userExists) {
        throw new ConflictException('user already exists');
      }
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(err.message);
      }
      throw err;
    }
  }

  async signup(signUpParams: SignupParams) {
    try {
      await this.checkExistingUser(signUpParams.nationalId, signUpParams.email);

      this.passwordMatches(signUpParams.password, signUpParams.passwordConfirm);

      delete signUpParams.passwordConfirm;

      signUpParams.password = await bcrypt.hash(signUpParams.password, 10);

      const newUser = await this.userService.createUser(signUpParams);

      const tokens = await this.getTokens(newUser.id, newUser.email);

      const user = await this.updateRtHash(newUser.id, tokens.refresh_token);

      delete user.password;
      delete user.hashedRt;
      delete user.resetExpiresTime;
      delete user.resetPasswordToken;

      const data = {
        ...user,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      };

      return { status: HttpStatus.OK, message: 'signed up successfully', data };
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError || err.status === 500) {
        throw new InternalServerErrorException(err.message);
      }
      return err;
    }
  }

  async login({ email, password }: LoginParams) {
    try {
      const user = await this.userService.findOne({ email });

      if (!user) {
        throw new ForbiddenException('Incorrect email or password!');
      }

      await this.compareHashTrue(
        password,
        user.password,
        'Incorrect email or password!',
      );

      const tokens = await this.getTokens(user.id, user.email);

      const updatedUser = await this.updateRtHash(
        user.id,
        tokens.refresh_token,
      );

      delete updatedUser.password;
      delete updatedUser.hashedRt;
      delete updatedUser.resetExpiresTime;
      delete updatedUser.resetPasswordToken;

      const data = {
        ...updatedUser,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      };

      return { status: HttpStatus.OK, message: 'logged in successfully', data };
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError || err.status === 500) {
        throw new InternalServerErrorException(err.message);
      }
      return err;
    }
  }

  // Forget password logic
  async forgetPassword(forgetPasswordParams: ForgetParams) {
    try {
      const checkUser = await this.userService.findOne({
        email: forgetPasswordParams.email,
      });

      // Check if user exists
      if (!checkUser) {
        throw new NotFoundException('This Email not found!');
      }

      const { resetCode, token } = await this.generateOTP();

      const date = Date.now() + 1 * 60 * 1000;

      const data = {
        resetPasswordToken: token,
        resetExpiresTime: new Date(date),
      };

      const user = await this.userService.update(
        { email: forgetPasswordParams.email },
        data,
      );

      const to = user.email;
      const subject = 'Password Reset - ODC';

      const attachments = [
        {
          filename: 'ODC black.png',
          path: './src/assets/images/ODC black.png',
          cid: 'logo',
        },
      ];

      const htmlTemplate = (
        await FileSystemHelper.readFile(
          '../../templates/otp-email-template.html',
          {
            encoding: 'utf8',
          },
        )
      ).toString();

      // Replace the placeholder in the template with the dynamic value
      const htmlWithFirstName = htmlTemplate.replace(
        '%FIRST_NAME%',
        user.first_name,
      );

      const html = htmlWithFirstName.replace('%RESET_CODE%', resetCode);

      await this.emailService.sendEmail(to, subject, html, attachments);

      return { message: `check code in your email: ${user.email}` };
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(err.message);
      }
      throw err;
    }
  }

  // Confirm Code validating
  async confirmCode(ConfirmCodeParam: ConfirmParams) {
    try {
      // Encrypt the user's entered code to compare it with the code in db
      const hashedToken = await this.encrypt(
        ConfirmCodeParam.code,
        process.env.ENCRYPT_CODE_PASS,
      );

      const user = await this.userService.findOne({
        resetPasswordToken: hashedToken,
      });

      if (!user) {
        throw new BadRequestException('Reset code invalid or expired!');
      }

      const date = Date.now();

      if (user.resetExpiresTime < new Date(date)) {
        throw new BadRequestException('Reset code invalid or expired!');
      }

      return { token: user.resetPasswordToken };
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(err.message);
      }
      throw err;
    }
  }

  // Resetting the password
  async resetPassword(resetPasswordParam: ResetParams) {
    try {
      const userExists = await this.userService.findOne({
        resetPasswordToken: resetPasswordParam.token,
      });

      if (!userExists) {
        throw new ForbiddenException('Invalid token!');
      }

      await this.compareHashFalse(
        resetPasswordParam.newPassword,
        userExists.password,
        'You can not use the old password!',
      );

      this.passwordMatches(
        resetPasswordParam.newPassword,
        resetPasswordParam.newPasswordConfirm,
      );

      const hashedPassword = await bcrypt.hash(
        resetPasswordParam.newPassword,
        10,
      );

      const data = {
        password: hashedPassword,
        resetPasswordToken: null,
        resetExpiresTime: null,
      };

      await this.userService.updateMany(
        { resetPasswordToken: resetPasswordParam.token },
        data,
      );

      return { message: 'Password reseted successfully.' };
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(err);
      }
      throw err;
    }
  }

  async logout(userId: string) {
    try {
      const condition = {
        id: userId,
        hashedRt: {
          not: null,
        },
      };

      await this.userService.updateMany(condition, { hashedRt: null });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(err.message);
      }
      throw err;
    }
  }

  async refreshTokens(userId: string, refreshToken: string) {
    try {
      const user = await this.userService.findOne({ id: userId });

      if (!user || !user.hashedRt) {
        throw new ForbiddenException('Access Denied');
      }

      const refreshTokenCheck = await bcrypt.compare(user.hashedRt, refreshToken);

      if (!refreshTokenCheck) {
        throw new ForbiddenException('Access Denied');
      }

      const tokens = await this.getTokens(user.id, user.email);
      await this.updateRtHash(user.id, tokens.refresh_token);

      return { tokens };
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(err.message);
      }
      throw err;
    }
  }

  async getTokens(userId: string, email: string): Promise<Tokens> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: userId,
          email,
        },
        {
          secret: process.env.JWT_ACCESS_KEY,
          expiresIn: process.env.ACCESS_JWT_EXPIRES_IN,
        },
      ),
      this.jwtService.signAsync(
        {
          id: userId,
          email,
        },
        {
          secret: process.env.JWT_REFRESH_KEY,
          expiresIn: process.env.REFRESH_JWT_EXPIRES_IN,
        },
      ),
    ]);

    return { access_token, refresh_token };
  }

  async updateRtHash(userId: string, refreshToken: string) {
    try {
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

      return await this.userService.update(
        { id: userId },
        { hashedRt: hashedRefreshToken },
      );
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(err.message);
      }
      throw err;
    }
  }

  // encryption functoin
  async encrypt(text: string, secretKey: string) {
    const cipher = crypto.createCipher('aes-256-cbc', secretKey);
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    encrypted = encrypted.substring(0, 32);
    return encrypted;
  }

  async generateOTP() {
    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = await this.encrypt(resetCode, process.env.ENCRYPT_CODE_PASS);
    return { resetCode, token };
  }

  async compareHashTrue(
    content: string,
    hashedcontent: string,
    errMessage: string,
  ) {
    const passCheck = await bcrypt.compare(content, hashedcontent);
    if (!passCheck) {
      throw new ForbiddenException(errMessage);
    }
  }

  async compareHashFalse(
    content: string,
    hashedcontent: string,
    errMessage: string,
  ) {
    const passCheck = await bcrypt.compare(content, hashedcontent);
    if (passCheck) {
      throw new ForbiddenException(errMessage);
    }
  }
}
