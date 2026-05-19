import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import {
  User,
  Exercise,
  Workout,
  WorkoutExercise,
  WorkoutSet,
  WorkoutTemplate,
  TemplateExercise,
  WeightLog,
  BodyMeasurement,
  Habit,
  HabitLog,
  Streak,
  Achievement,
  Reminder,
  Notification,
  PR,
} from '../entities';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: configService.get<string>('DATABASE_URL'),
  entities: [
    User,
    Exercise,
    Workout,
    WorkoutExercise,
    WorkoutSet,
    WorkoutTemplate,
    TemplateExercise,
    WeightLog,
    BodyMeasurement,
    Habit,
    HabitLog,
    Streak,
    Achievement,
    Reminder,
    Notification,
    PR,
  ],
  synchronize: configService.get<string>('NODE_ENV') === 'development',
  ssl: { rejectUnauthorized: false },
  logging: configService.get<string>('NODE_ENV') === 'development',
  extra: {
    max: 10,
    connectionTimeoutMillis: 10000,
  },
});
