import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsPhoneNumber,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @IsString({ message: 'Please provide your first name' })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  first_name: string;

  @IsString({ message: 'Please provide your last name' })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  last_name: string;

  @IsEmail(undefined, { message: 'Please provide a valid Email' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_!@#$%^&*(),.?":{}|<>])(?!\s).*$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol',
    },
  )
  password: string;

  @IsString()
  @IsNotEmpty()
  passwordConfirm: string;

  @IsPhoneNumber('EG')
  @Length(11, 11)
  @IsString()
  // @ApiProperty({ enumName: 'string' })
  phone: string;

  @IsNumberString({}, { message: 'Please provide a valid national id' })
  @IsNotEmpty()
  @Length(14, 14, { message: 'Please provide a valid national id' })
  nationalId: string;
}
