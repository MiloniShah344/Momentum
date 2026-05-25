import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from '../entities/exercise.entity';
import { ExerciseFavorite } from '../entities/exercise-favorite.entity';
import { ExercisesService } from './exercises.service';
import { ExercisesController } from './exercises.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise, ExerciseFavorite])],
  controllers: [ExercisesController],
  providers: [ExercisesService, JwtAuthGuard],
  exports: [ExercisesService],
})
export class ExercisesModule {}
