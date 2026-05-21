import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Workout } from '../entities/workout.entity';
import { Habit } from '../entities/habit.entity';
import { HabitLog } from '../entities/habit-log.entity';
import { WeightLog } from '../entities/weight-log.entity';
import { Streak } from '../entities/streak.entity';
import { Achievement } from '../entities/achievement.entity';
import { UsersModule } from '../users/users.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Workout,
      Habit,
      HabitLog,
      WeightLog,
      Streak,
      Achievement,
    ]),
    UsersModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService, JwtAuthGuard],
})
export class DashboardModule {}
