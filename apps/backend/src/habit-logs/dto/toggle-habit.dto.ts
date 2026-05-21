import { IsString, IsUUID, Matches } from 'class-validator';

export class ToggleHabitDto {
  @IsUUID()
  habit_id: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' })
  date: string;
}
