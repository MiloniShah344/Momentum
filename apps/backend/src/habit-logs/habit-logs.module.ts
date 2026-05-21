import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HabitLog } from '../entities/habit-log.entity';
import { Habit } from '../entities/habit.entity';
import { HabitLogsService } from './habit-logs.service';
import { HabitLogsController } from './habit-logs.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([HabitLog, Habit])],
  controllers: [HabitLogsController],
  providers: [HabitLogsService, JwtAuthGuard],
  exports: [HabitLogsService],
})
export class HabitLogsModule {}
