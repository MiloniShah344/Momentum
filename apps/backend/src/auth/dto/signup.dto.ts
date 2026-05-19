import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class SignupDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(72, { message: 'Password must be less than 72 characters' })
  password: string;

  @IsString()
  @MinLength(2, { message: 'Display name must be at least 2 characters' })
  @MaxLength(100, { message: 'Display name must be less than 100 characters' })
  display_name: string;
}
