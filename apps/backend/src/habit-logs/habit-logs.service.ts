import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HabitLog } from '../entities/habit-log.entity';
import { Habit } from '../entities/habit.entity';
import { ToggleHabitDto } from './dto/toggle-habit.dto';

@Injectable()
export class HabitLogsService {
  constructor(
    @InjectRepository(HabitLog)
    private habitLogRepo: Repository<HabitLog>,

    @InjectRepository(Habit)
    private habitRepo: Repository<Habit>,
  ) {}

  async toggle(userId: string, dto: ToggleHabitDto) {
    // Verify habit belongs to this user
    const habit = await this.habitRepo.findOne({
      where: { id: dto.habit_id, user_id: userId },
    });

    if (!habit) {
      throw new NotFoundException('Habit not found or does not belong to you.');
    }

    // Look for an existing log for this habit + date
    const existing = await this.habitLogRepo.findOne({
      where: {
        habit_id: dto.habit_id,
        user_id: userId,
        date: dto.date,
      },
    });

    if (existing) {
      existing.is_completed = !existing.is_completed;
      const saved = await this.habitLogRepo.save(existing);
      return { is_completed: saved.is_completed };
    }

    // No existing log — create one (completed)
    const log = this.habitLogRepo.create({
      habit_id: dto.habit_id,
      user_id: userId,
      date: dto.date,
      is_completed: true,
    });
    await this.habitLogRepo.save(log);
    return { is_completed: true };
  }
}
