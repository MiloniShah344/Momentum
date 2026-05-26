import { IsUUID, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class AddExerciseToWorkoutDto {
  @IsUUID()
  exercise_id: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number;

  @IsOptional()
  notes?: string;
}
