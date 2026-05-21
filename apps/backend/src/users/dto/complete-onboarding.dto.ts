import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class MeasurementsDto {
  @IsOptional() @IsNumber() @Type(() => Number) waist?: number;
  @IsOptional() @IsNumber() @Type(() => Number) chest?: number;
  @IsOptional() @IsNumber() @Type(() => Number) arms?: number;
  @IsOptional() @IsNumber() @Type(() => Number) thighs?: number;
  @IsOptional() @IsNumber() @Type(() => Number) hips?: number;
  @IsOptional() @IsNumber() @Type(() => Number) neck?: number;
}

export class CompleteOnboardingDto {
  @IsOptional() @IsString() display_name?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(50)
  @Max(300)
  height?: number;

  @IsOptional() @IsString() weight_unit?: string;
  @IsOptional() @IsString() measurement_unit?: string;
  @IsOptional() @IsString() fitness_goal?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(7)
  workout_frequency_goal?: number;

  @IsOptional() @IsArray() preferred_workout_days?: string[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(700)
  current_weight?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(700)
  goal_weight?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => MeasurementsDto)
  measurements?: MeasurementsDto;

  @IsOptional() @IsArray() selected_habits?: string[];
}
