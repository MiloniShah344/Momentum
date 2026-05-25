import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from '../entities/exercise.entity';
import { ExerciseFavorite } from '../entities/exercise-favorite.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { QueryExercisesDto } from './dto/query-exercises.dto';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepo: Repository<Exercise>,

    @InjectRepository(ExerciseFavorite)
    private favoriteRepo: Repository<ExerciseFavorite>,
  ) {}

  async findAll(userId: string, query: QueryExercisesDto) {
    const page = Math.max(1, parseInt(query.page || '1'));
    const limit = Math.min(50, parseInt(query.limit || '30'));

    const qb = this.exerciseRepo
      .createQueryBuilder('e')
      .where('(e.is_global = true OR e.created_by = :userId)', { userId });

    if (query.search?.trim()) {
      qb.andWhere('e.name ILIKE :search', {
        search: `%${query.search.trim()}%`,
      });
    }
    if (query.muscle_group) {
      qb.andWhere('e.muscle_group = :mg', { mg: query.muscle_group });
    }
    if (query.equipment) {
      qb.andWhere('e.equipment = :eq', { eq: query.equipment });
    }
    if (query.difficulty) {
      qb.andWhere('e.difficulty = :diff', { diff: query.difficulty });
    }

    qb.orderBy('e.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [exercises, total] = await qb.getManyAndCount();

    // Attach favorite status
    const favorites = await this.favoriteRepo.find({
      where: { user_id: userId },
    });
    const favSet = new Set(favorites.map((f) => f.exercise_id));

    return {
      exercises: exercises.map((e) => ({
        ...e,
        is_favorite: favSet.has(e.id),
        is_custom: e.created_by === userId,
      })),
      total,
      page,
      total_pages: Math.ceil(total / limit),
      has_next: page * limit < total,
    };
  }

  async findOne(id: string, userId: string) {
    const exercise = await this.exerciseRepo.findOne({
      where: [
        { id, is_global: true },
        { id, created_by: userId },
      ],
    });

    if (!exercise) throw new NotFoundException('Exercise not found.');

    const favorite = await this.favoriteRepo.findOne({
      where: { user_id: userId, exercise_id: id },
    });

    return {
      ...exercise,
      is_favorite: !!favorite,
      is_custom: exercise.created_by === userId,
    };
  }

  async getFavorites(userId: string) {
    const favorites = await this.favoriteRepo.find({
      where: { user_id: userId },
    });
    if (!favorites.length) return { exercises: [], total: 0 };

    const exerciseIds = favorites.map((f) => f.exercise_id);
    const exercises = await this.exerciseRepo
      .createQueryBuilder('e')
      .where('e.id IN (:...ids)', { ids: exerciseIds })
      .orderBy('e.name', 'ASC')
      .getMany();

    return {
      exercises: exercises.map((e) => ({
        ...e,
        is_favorite: true,
        is_custom: e.created_by === userId,
      })),
      total: exercises.length,
    };
  }

  async create(userId: string, dto: CreateExerciseDto) {
    const exercise = this.exerciseRepo.create({
      ...dto,
      is_global: false,
      created_by: userId,
    });
    const saved = await this.exerciseRepo.save(exercise);
    return { ...saved, is_favorite: false, is_custom: true };
  }

  async update(id: string, userId: string, dto: UpdateExerciseDto) {
    const exercise = await this.exerciseRepo.findOne({ where: { id } });
    if (!exercise) throw new NotFoundException('Exercise not found.');
    if (exercise.created_by !== userId)
      throw new ForbiddenException("Cannot edit global or others' exercises.");

    Object.assign(exercise, dto);
    const saved = await this.exerciseRepo.save(exercise);
    return { ...saved, is_custom: true };
  }

  async remove(id: string, userId: string) {
    const exercise = await this.exerciseRepo.findOne({ where: { id } });
    if (!exercise) throw new NotFoundException('Exercise not found.');
    if (exercise.created_by !== userId)
      throw new ForbiddenException('Cannot delete this exercise.');

    await this.exerciseRepo.remove(exercise);
    await this.favoriteRepo.delete({ exercise_id: id });
    return { message: 'Exercise deleted.' };
  }

  async toggleFavorite(exerciseId: string, userId: string) {
    // Ensure exercise is accessible
    await this.findOne(exerciseId, userId);

    const existing = await this.favoriteRepo.findOne({
      where: { user_id: userId, exercise_id: exerciseId },
    });

    if (existing) {
      await this.favoriteRepo.remove(existing);
      return { is_favorite: false };
    }

    await this.favoriteRepo.save(
      this.favoriteRepo.create({ user_id: userId, exercise_id: exerciseId }),
    );
    return { is_favorite: true };
  }
}
