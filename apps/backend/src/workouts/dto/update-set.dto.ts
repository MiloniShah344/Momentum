import { IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSetDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  reps?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  weight?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  rpe?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  rest_time?: number;

  @IsOptional()
  @IsBoolean()
  is_completed?: boolean;
}
