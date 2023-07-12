import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
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
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  newPasswordConfirm: string;

  @IsString({ message: 'Please provide a token' })
  @IsNotEmpty()
  token: string;
}
