import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmCodeDto {
  @IsString({ message: 'Please provide your reset code!' })
  @IsNotEmpty()
  code: string;
}
