import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateExerciseDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsString()
  muscle_group: string;

  @IsString()
  equipment: string;

  @IsString()
  difficulty: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  instructions?: string;
}
