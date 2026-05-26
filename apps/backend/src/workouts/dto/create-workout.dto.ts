import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateWorkoutDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  workout_type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
