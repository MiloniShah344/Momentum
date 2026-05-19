import { IsString, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(72, { message: 'Password must be less than 72 characters' })
  password: string;

  @IsString()
  access_token: string;
}
