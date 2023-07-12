import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgetPasswordDto {
  @IsEmail(undefined, { message: 'Please provide a valid Email!' })
  @IsNotEmpty()
  email: string;
}
