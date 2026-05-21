import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { WeightLog } from '../entities/weight-log.entity';
import { BodyMeasurement } from '../entities/body-measurement.entity';
import { Habit } from '../entities/habit.entity';
import { Streak } from '../entities/streak.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, WeightLog, BodyMeasurement, Habit, Streak]),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtAuthGuard],
  exports: [UsersService],
})
export class UsersModule {}
