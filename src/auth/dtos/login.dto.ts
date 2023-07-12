import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail(undefined, { message: 'Please provide a valid Email!' })
  @IsNotEmpty()
  email: string;

  @IsString({ message: 'Please provide your password!' })
  @IsNotEmpty()
  password: string;
}
