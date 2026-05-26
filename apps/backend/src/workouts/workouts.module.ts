import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workout } from '../entities/workout.entity';
import { WorkoutExercise } from '../entities/workout-exercise.entity';
import { WorkoutSet } from '../entities/set.entity';
import { Exercise } from '../entities/exercise.entity';
import { Streak } from '../entities/streak.entity';
import { PR } from '../entities/pr.entity';
import { Achievement } from '../entities/achievement.entity';
import { User } from '../entities/user.entity';
import { WorkoutsService } from './workouts.service';
import { WorkoutsController } from './workouts.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Workout,
      WorkoutExercise,
      WorkoutSet,
      Exercise,
      Streak,
      PR,
      Achievement,
      User,
    ]),
  ],
  controllers: [WorkoutsController],
  providers: [WorkoutsService, JwtAuthGuard],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}
