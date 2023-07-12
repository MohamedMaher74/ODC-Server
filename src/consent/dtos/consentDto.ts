import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConsentDto {
  @ApiProperty()
  @IsString({ message: 'Please provide consent as a valid string' })
  @IsNotEmpty()
  content: string;
}
