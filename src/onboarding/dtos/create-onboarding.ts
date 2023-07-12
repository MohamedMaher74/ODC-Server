import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class OnBoardingDto {
  @IsString({ message: 'Please provide the title!' })
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsString({ message: 'Please provide the description!' })
  @IsNotEmpty()
  @ApiProperty()
  description: string;
}
