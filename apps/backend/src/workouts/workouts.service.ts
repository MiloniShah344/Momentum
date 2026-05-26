/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Workout } from '../entities/workout.entity';
import { WorkoutExercise } from '../entities/workout-exercise.entity';
import { WorkoutSet } from '../entities/set.entity';
import { Exercise } from '../entities/exercise.entity';
import { Streak } from '../entities/streak.entity';
import { PR } from '../entities/pr.entity';
import { Achievement } from '../entities/achievement.entity';
import { User } from '../entities/user.entity';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { AddExerciseToWorkoutDto } from './dto/add-exercise.dto';
import { AddSetDto } from './dto/add-set.dto';
import { UpdateSetDto } from './dto/update-set.dto';
import { QueryWorkoutsDto } from './dto/query-workouts.dto';

const ACHIEVEMENT_DEFINITIONS = [
  {
    key: 'first_workout',
    title: 'First Sweat 💦',
    desc: 'Completed your first workout',
    condition: (ctx: any) => ctx.totalWorkouts >= 1,
  },
  {
    key: 'five_workouts',
    title: 'Getting Started 🏋️',
    desc: '5 workouts completed',
    condition: (ctx: any) => ctx.totalWorkouts >= 5,
  },
  {
    key: 'ten_workouts',
    title: 'Double Digits 💪',
    desc: '10 workouts completed',
    condition: (ctx: any) => ctx.totalWorkouts >= 10,
  },
  {
    key: 'thirty_workouts',
    title: 'Monthly Grind 📅',
    desc: '30 workouts completed',
    condition: (ctx: any) => ctx.totalWorkouts >= 30,
  },
  {
    key: 'week_streak',
    title: 'Week Warrior 🔥',
    desc: '7-day workout streak',
    condition: (ctx: any) => ctx.currentStreak >= 7,
  },
  {
    key: 'month_streak',
    title: 'Iron Consistent 🏆',
    desc: '30-day workout streak',
    condition: (ctx: any) => ctx.currentStreak >= 30,
  },
  {
    key: 'first_pr',
    title: 'PR Machine ⚡',
    desc: 'Set your first personal record',
    condition: (ctx: any) => ctx.newPRsCount >= 1,
  },
];

@Injectable()
export class WorkoutsService {
  constructor(
    @InjectRepository(Workout) private workoutRepo: Repository<Workout>,
    @InjectRepository(WorkoutExercise)
    private weRepo: Repository<WorkoutExercise>,
    @InjectRepository(WorkoutSet) private setRepo: Repository<WorkoutSet>,
    @InjectRepository(Exercise) private exerciseRepo: Repository<Exercise>,
    @InjectRepository(Streak) private streakRepo: Repository<Streak>,
    @InjectRepository(PR) private prRepo: Repository<PR>,
    @InjectRepository(Achievement)
    private achievementRepo: Repository<Achievement>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  // ── Helpers ──────────────────────────────────────────────────────────

  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  private async verifyWorkoutOwnership(
    id: string,
    userId: string,
  ): Promise<Workout> {
    const workout = await this.workoutRepo.findOne({ where: { id } });
    if (!workout) throw new NotFoundException('Workout not found.');
    if (workout.user_id !== userId)
      throw new ForbiddenException('Access denied.');
    return workout;
  }

  // ── CRUD ─────────────────────────────────────────────────────────────

  async create(userId: string, dto: CreateWorkoutDto) {
    const today = this.getToday();
    const workout = this.workoutRepo.create({
      user_id: userId,
      title: dto.title || 'My Workout',
      date: dto.date || today,
      workout_type: dto.workout_type || 'custom',
      notes: dto.notes,
      status: 'in_progress',
    });
    return this.workoutRepo.save(workout);
  }

  async findAll(userId: string, query: QueryWorkoutsDto) {
    const page = Math.max(1, parseInt(query.page || '1'));
    const limit = Math.min(30, parseInt(query.limit || '15'));

    const qb = this.workoutRepo
      .createQueryBuilder('w')
      .where('w.user_id = :userId', { userId });

    if (query.search) {
      qb.andWhere('(w.title ILIKE :s OR w.notes ILIKE :s)', {
        s: `%${query.search}%`,
      });
    }
    if (query.workout_type)
      qb.andWhere('w.workout_type = :wt', { wt: query.workout_type });
    if (query.status) qb.andWhere('w.status = :st', { st: query.status });
    if (query.date_from) qb.andWhere('w.date >= :df', { df: query.date_from });
    if (query.date_to) qb.andWhere('w.date <= :dt', { dt: query.date_to });

    qb.orderBy('w.date', 'DESC').addOrderBy('w.created_at', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [workouts, total] = await qb.getManyAndCount();

    // Enrich with exercise count and volume
    const enriched = await Promise.all(
      workouts.map(async (w) => {
        const wes = await this.weRepo.find({ where: { workout_id: w.id } });
        let volume = 0;
        let totalSets = 0;
        if (wes.length) {
          const sets = await this.setRepo.find({
            where: {
              workout_exercise_id: In(wes.map((we) => we.id)),
              is_completed: true,
            },
          });
          totalSets = sets.length;
          volume = sets.reduce(
            (sum, s) => sum + Number(s.weight || 0) * Number(s.reps || 0),
            0,
          );
        }
        return {
          ...w,
          exercise_count: wes.length,
          total_sets: totalSets,
          total_volume: Math.round(volume),
        };
      }),
    );

    return {
      workouts: enriched,
      total,
      page,
      total_pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string) {
    const workout = await this.verifyWorkoutOwnership(id, userId);

    const wes = await this.weRepo.find({
      where: { workout_id: id },
      order: { order: 'ASC' },
    });

    const exerciseIds = wes.map((we) => we.exercise_id);
    const exercises = exerciseIds.length
      ? await this.exerciseRepo.find({ where: { id: In(exerciseIds) } })
      : [];
    const exerciseMap = new Map(exercises.map((e) => [e.id, e]));

    const allSets = wes.length
      ? await this.setRepo.find({
          where: { workout_exercise_id: In(wes.map((we) => we.id)) },
          order: { set_number: 'ASC' },
        })
      : [];

    const setsMap = new Map<string, WorkoutSet[]>();
    allSets.forEach((s) => {
      if (!setsMap.has(s.workout_exercise_id))
        setsMap.set(s.workout_exercise_id, []);
      setsMap.get(s.workout_exercise_id)!.push(s);
    });

    const exercisesWithSets = wes.map((we) => {
      const ex = exerciseMap.get(we.exercise_id);
      const sets = setsMap.get(we.id) || [];
      return {
        workout_exercise_id: we.id,
        exercise_id: we.exercise_id,
        exercise_name: ex?.name || 'Unknown Exercise',
        muscle_group: ex?.muscle_group || '',
        equipment: ex?.equipment || '',
        order: we.order,
        sets,
      };
    });

    const completedSets = allSets.filter((s) => s.is_completed);
    const totalVolume = completedSets.reduce(
      (sum, s) => sum + Number(s.weight || 0) * Number(s.reps || 0),
      0,
    );

    return {
      ...workout,
      exercises: exercisesWithSets,
      summary: {
        total_volume: Math.round(totalVolume),
        total_sets: completedSets.length,
        total_exercises: wes.length,
      },
    };
  }

  async update(id: string, userId: string, dto: UpdateWorkoutDto) {
    const workout = await this.verifyWorkoutOwnership(id, userId);
    Object.assign(workout, dto);
    return this.workoutRepo.save(workout);
  }

  async remove(id: string, userId: string) {
    const workout = await this.verifyWorkoutOwnership(id, userId);
    await this.workoutRepo.remove(workout);
    return { message: 'Workout deleted.' };
  }

  // ── Complete ──────────────────────────────────────────────────────────

  async complete(id: string, userId: string) {
    const workout = await this.verifyWorkoutOwnership(id, userId);
    if (workout.status === 'completed')
      throw new BadRequestException('Already completed.');

    const now = new Date();
    const durationMs = now.getTime() - new Date(workout.created_at).getTime();
    const durationMinutes = Math.max(1, Math.round(durationMs / 60000));

    workout.status = 'completed';
    workout.completed_at = now;
    workout.duration = durationMinutes;
    await this.workoutRepo.save(workout);

    // Gather all sets
    const wes = await this.weRepo.find({ where: { workout_id: id } });
    const allSets = wes.length
      ? await this.setRepo.find({
          where: { workout_exercise_id: In(wes.map((we) => we.id)) },
        })
      : [];
    const completedSets = allSets.filter((s) => s.is_completed);
    const totalVolume = completedSets.reduce(
      (sum, s) => sum + Number(s.weight || 0) * Number(s.reps || 0),
      0,
    );

    // Update streak
    const newStreak = await this.updateStreak(userId);

    // Check PRs
    const newPRs = await this.checkPRs(id, userId, wes, allSets);

    // Check achievements
    const totalWorkouts = await this.workoutRepo.count({
      where: { user_id: userId, status: 'completed' },
    });
    const newAchievements = await this.checkAchievements(userId, {
      totalWorkouts,
      currentStreak: newStreak,
      newPRsCount: newPRs.length,
    });

    return {
      workout: { ...workout, duration: durationMinutes },
      summary: {
        total_volume: Math.round(totalVolume),
        total_sets: completedSets.length,
        total_exercises: wes.length,
        duration_minutes: durationMinutes,
      },
      new_prs: newPRs,
      new_streak: newStreak,
      new_achievements: newAchievements,
    };
  }

  private async updateStreak(userId: string): Promise<number> {
    const today = this.getToday();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];

    let streak = await this.streakRepo.findOne({ where: { user_id: userId } });

    if (!streak) {
      streak = this.streakRepo.create({
        user_id: userId,
        current_workout_streak: 1,
        best_workout_streak: 1,
        last_workout_date: today,
      });
    } else if (streak.last_workout_date === today) {
      return streak.current_workout_streak;
    } else if (streak.last_workout_date === yStr) {
      streak.current_workout_streak += 1;
      if (streak.current_workout_streak > streak.best_workout_streak)
        streak.best_workout_streak = streak.current_workout_streak;
    } else {
      streak.current_workout_streak = 1;
    }

    streak.last_workout_date = today;
    await this.streakRepo.save(streak);
    return streak.current_workout_streak;
  }

  private async checkPRs(
    workoutId: string,
    userId: string,
    wes: WorkoutExercise[],
    allSets: WorkoutSet[],
  ) {
    const newPRs: Array<{
      exercise_id: string;
      exercise_name: string;
      weight: number;
      reps: number;
      estimated_1rm: number;
    }> = [];
    const today = this.getToday();

    for (const we of wes) {
      const exSets = allSets.filter(
        (s) =>
          s.workout_exercise_id === we.id &&
          s.is_completed &&
          s.weight &&
          s.reps,
      );
      if (!exSets.length) continue;

      let best1RM = 0;
      let bestSet: WorkoutSet | null = null;
      for (const s of exSets) {
        const e1rm = Number(s.weight) * (1 + Number(s.reps) / 30);
        if (e1rm > best1RM) {
          best1RM = e1rm;
          bestSet = s;
        }
      }
      if (!bestSet) continue;

      const existingPR = await this.prRepo.findOne({
        where: { user_id: userId, exercise_id: we.exercise_id },
        order: { estimated_1rm: 'DESC' },
      });

      if (!existingPR || best1RM > Number(existingPR.estimated_1rm || 0)) {
        const exercise = await this.exerciseRepo.findOne({
          where: { id: we.exercise_id },
        });
        await this.prRepo.save(
          this.prRepo.create({
            user_id: userId,
            exercise_id: we.exercise_id,
            weight: bestSet.weight,
            reps: bestSet.reps,
            estimated_1rm: Math.round(best1RM * 10) / 10,
            set_id: bestSet.id,
            workout_id: workoutId,
            achieved_at: today,
          }),
        );
        newPRs.push({
          exercise_id: we.exercise_id,
          exercise_name: exercise?.name || 'Unknown',
          weight: Number(bestSet.weight),
          reps: Number(bestSet.reps),
          estimated_1rm: Math.round(best1RM * 10) / 10,
        });
      }
    }

    return newPRs;
  }

  private async checkAchievements(
    userId: string,
    ctx: { totalWorkouts: number; currentStreak: number; newPRsCount: number },
  ) {
    const existingKeys = await this.achievementRepo.find({
      where: { user_id: userId },
    });
    const unlockedSet = new Set(existingKeys.map((a) => a.achievement_key));
    const now = new Date();
    const newOnes: Achievement[] = [];

    for (const def of ACHIEVEMENT_DEFINITIONS) {
      if (unlockedSet.has(def.key)) continue;
      if (def.condition(ctx)) {
        const a = this.achievementRepo.create({
          user_id: userId,
          achievement_key: def.key,
          title: def.title,
          description: def.desc,
          unlocked_at: now,
        });
        await this.achievementRepo.save(a);
        newOnes.push(a);
      }
    }
    return newOnes;
  }

  // ── Exercises ─────────────────────────────────────────────────────────

  async addExercise(
    workoutId: string,
    userId: string,
    dto: AddExerciseToWorkoutDto,
  ) {
    await this.verifyWorkoutOwnership(workoutId, userId);

    const exercise = await this.exerciseRepo.findOne({
      where: { id: dto.exercise_id },
    });
    if (!exercise) throw new NotFoundException('Exercise not found.');

    const existingCount = await this.weRepo.count({
      where: { workout_id: workoutId },
    });
    const we = this.weRepo.create({
      workout_id: workoutId,
      exercise_id: dto.exercise_id,
      order: dto.order ?? existingCount,
      notes: dto.notes,
    });
    const saved = await this.weRepo.save(we);

    return {
      workout_exercise_id: saved.id,
      workout_id: saved.workout_id,
      exercise_id: saved.exercise_id,
      order: saved.order,
      exercise_name: exercise.name,
      muscle_group: exercise.muscle_group,
      equipment: exercise.equipment,
      sets: [],
    };
  }

  async removeExercise(
    workoutId: string,
    workoutExerciseId: string,
    userId: string,
  ) {
    await this.verifyWorkoutOwnership(workoutId, userId);
    const we = await this.weRepo.findOne({
      where: { id: workoutExerciseId, workout_id: workoutId },
    });
    if (!we) throw new NotFoundException('Exercise not in this workout.');
    // Delete its sets first
    await this.setRepo.delete({ workout_exercise_id: workoutExerciseId });
    await this.weRepo.remove(we);
    return { message: 'Exercise removed.' };
  }

  // ── Sets ─────────────────────────────────────────────────────────────

  async addSet(
    workoutId: string,
    workoutExerciseId: string,
    userId: string,
    dto: AddSetDto,
  ) {
    console.log('workoutId', workoutId);
    console.log('workoutExerciseId', workoutExerciseId);
    console.log('dto', dto);
    console.log('userId', userId);
    await this.verifyWorkoutOwnership(workoutId, userId);
    const we = await this.weRepo.findOne({
      where: { id: workoutExerciseId, workout_id: workoutId },
    });
    if (!we) throw new NotFoundException('Exercise not found in this workout.');

    const count = await this.setRepo.count({
      where: { workout_exercise_id: workoutExerciseId },
    });
    const set = this.setRepo.create({
      workout_exercise_id: workoutExerciseId,
      set_number: count + 1,
      reps: dto.reps,
      weight: dto.weight,
      rpe: dto.rpe,
      rest_time: dto.rest_time,
      is_completed: dto.is_completed ?? false,
    });
    return this.setRepo.save(set);
  }

  async updateSet(
    workoutId: string,
    setId: string,
    userId: string,
    dto: UpdateSetDto,
  ) {
    await this.verifyWorkoutOwnership(workoutId, userId);
    const set = await this.setRepo.findOne({ where: { id: setId } });
    if (!set) throw new NotFoundException('Set not found.');
    Object.assign(set, dto);
    return this.setRepo.save(set);
  }

  async removeSet(workoutId: string, setId: string, userId: string) {
    await this.verifyWorkoutOwnership(workoutId, userId);
    const set = await this.setRepo.findOne({ where: { id: setId } });
    if (!set) throw new NotFoundException('Set not found.');
    await this.setRepo.remove(set);
    return { message: 'Set removed.' };
  }

  // ── Previous performance ──────────────────────────────────────────────

  async getPreviousPerformance(workoutId: string, userId: string) {
    await this.verifyWorkoutOwnership(workoutId, userId);
    const wes = await this.weRepo.find({ where: { workout_id: workoutId } });
    const result: Record<
      string,
      { sets: Array<{ reps: number; weight: number }>; date: string }
    > = {};

    for (const we of wes) {
      const prevWE = await this.weRepo
        .createQueryBuilder('we')
        .innerJoin('workouts', 'w', 'w.id = we.workout_id')
        .where('we.exercise_id = :eid', { eid: we.exercise_id })
        .andWhere('w.user_id = :uid', { uid: userId })
        .andWhere('w.status = :st', { st: 'completed' })
        .andWhere('w.id != :wid', { wid: workoutId })
        .orderBy('w.completed_at', 'DESC')
        .getOne();

      if (prevWE) {
        const sets = await this.setRepo.find({
          where: { workout_exercise_id: prevWE.id, is_completed: true },
          order: { set_number: 'ASC' },
        });
        const w = await this.workoutRepo.findOne({
          where: { id: prevWE.workout_id },
        });
        result[we.exercise_id] = {
          sets: sets.map((s) => ({
            reps: Number(s.reps || 0),
            weight: Number(s.weight || 0),
          })),
          date: w?.date || '',
        };
      }
    }

    return result;
  }
}
