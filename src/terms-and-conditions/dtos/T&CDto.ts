import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TermsAndConditionsDto {
  @ApiProperty()
  @IsString({ message: 'Please provide terms and condition as a valid string' })
  @IsNotEmpty()
  content: string;
}
