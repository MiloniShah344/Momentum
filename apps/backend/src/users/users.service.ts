import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { WeightLog } from '../entities/weight-log.entity';
import { BodyMeasurement } from '../entities/body-measurement.entity';
import { Habit } from '../entities/habit.entity';
import { Streak } from '../entities/streak.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';

// Default habits created during onboarding
const HABIT_TEMPLATES: Record<
  string,
  {
    name: string;
    type: string;
    target_value: number | null;
    unit: string | null;
  }
> = {
  water: {
    name: 'Water intake',
    type: 'water',
    target_value: 8,
    unit: 'glasses',
  },
  protein: {
    name: 'Protein goal',
    type: 'protein',
    target_value: 150,
    unit: 'grams',
  },
  sleep: { name: 'Sleep goal', type: 'sleep', target_value: 8, unit: 'hours' },
  stretching: {
    name: 'Stretching',
    type: 'stretching',
    target_value: null,
    unit: null,
  },
  meditation: {
    name: 'Meditation',
    type: 'meditation',
    target_value: null,
    unit: null,
  },
  steps: {
    name: 'Steps goal',
    type: 'steps',
    target_value: 10000,
    unit: 'steps',
  },
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(WeightLog)
    private weightLogRepository: Repository<WeightLog>,

    @InjectRepository(BodyMeasurement)
    private measurementRepository: Repository<BodyMeasurement>,

    @InjectRepository(Habit)
    private habitRepository: Repository<Habit>,

    @InjectRepository(Streak)
    private streakRepository: Repository<Streak>,
  ) {}

  // ── Finders ──────────────────────────────────────────────────

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password_hash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password_reset_token')
      .where('user.password_reset_token = :token', { token })
      .andWhere('user.password_reset_expires > :now', { now: new Date() })
      .getOne();
  }

  // ── Creators ─────────────────────────────────────────────────

  async create(data: {
    email: string;
    password_hash: string;
    display_name?: string;
  }): Promise<User> {
    const user = this.usersRepository.create({
      email: data.email,
      password_hash: data.password_hash,
      display_name: data.display_name || undefined,
      onboarding_complete: false,
    });
    return this.usersRepository.save(user);
  }

  // ── Profile ───────────────────────────────────────────────────

  async getProfile(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }

  async updateProfile(
    id: string,
    dto: UpdateProfileDto,
  ): Promise<{ user: User }> {
    const user = await this.getProfile(id);

    Object.assign(user, dto);
    const updated = await this.usersRepository.save(user);

    return { user: updated };
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, data);
    const updated = await this.findById(id);
    if (!updated) throw new NotFoundException('User not found.');
    return updated;
  }

  // ── Onboarding ────────────────────────────────────────────────

  async completeOnboarding(
    userId: string,
    dto: CompleteOnboardingDto,
  ): Promise<{ user: User }> {
    const user = await this.getProfile(userId);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // 1. Update user profile fields
    const profileUpdates: Partial<User> = {
      onboarding_complete: true,
    };
    if (dto.display_name) profileUpdates.display_name = dto.display_name;
    if (dto.height) profileUpdates.height = dto.height;
    if (dto.weight_unit) profileUpdates.weight_unit = dto.weight_unit;
    if (dto.measurement_unit)
      profileUpdates.measurement_unit = dto.measurement_unit;
    if (dto.fitness_goal) profileUpdates.fitness_goal = dto.fitness_goal;
    if (dto.workout_frequency_goal)
      profileUpdates.workout_frequency_goal = dto.workout_frequency_goal;
    if (dto.preferred_workout_days)
      profileUpdates.preferred_workout_days = dto.preferred_workout_days;
    if (dto.current_weight) profileUpdates.current_weight = dto.current_weight;
    if (dto.goal_weight) profileUpdates.goal_weight = dto.goal_weight;

    await this.usersRepository.update(userId, profileUpdates);

    // 2. Create initial weight log
    if (dto.current_weight) {
      await this.weightLogRepository.save(
        this.weightLogRepository.create({
          user_id: userId,
          weight: dto.current_weight,
          unit: dto.weight_unit || user.weight_unit || 'kg',
          date: today,
          note: 'Starting weight',
        }),
      );
    }

    // 3. Create body measurements
    const measurements = dto.measurements;
    const hasMeasurements =
      measurements &&
      Object.values(measurements).some(
        (v) => v !== null && v !== undefined && v !== 0,
      );

    if (hasMeasurements) {
      //   await this.measurementRepository.save(
      //     this.measurementRepository.create({
      //       user_id: userId,
      //       date: today,
      //       unit: dto.measurement_unit || user.measurement_unit || 'cm',
      //       waist: measurements?.waist || null,
      //       chest: measurements?.chest || null,
      //       arms: measurements?.arms || null,
      //       thighs: measurements?.thighs || null,
      //       hips: measurements?.hips || null,
      //       neck: measurements?.neck || null,
      //     }),
      //   );
      const measurementData: Partial<BodyMeasurement> = {
        user_id: userId,
        date: today,
        unit: dto.measurement_unit || user.measurement_unit || 'cm',
        waist: measurements.waist || undefined,
        chest: measurements.chest || undefined,
        arms: measurements.arms || undefined,
        thighs: measurements.thighs || undefined,
        hips: measurements.hips || undefined,
        neck: measurements.neck || undefined,
      };
      await this.measurementRepository.save(
        this.measurementRepository.create(measurementData),
      );
    }

    // 4. Create selected habits
    if (dto.selected_habits && dto.selected_habits.length > 0) {
      const habits = dto.selected_habits
        .filter((key) => HABIT_TEMPLATES[key])
        .map((key) => {
          const template = HABIT_TEMPLATES[key];
          return this.habitRepository.create({
            user_id: userId,
            name: template.name,
            type: template.type,
            is_enabled: true,
            is_default: true,
            target_value: template.target_value ?? undefined,
            unit: template.unit ?? undefined,
          });
        });

      if (habits.length > 0) {
        await this.habitRepository.save(habits);
      }
    }

    // 5. Create initial streak record
    const existingStreak = await this.streakRepository.findOne({
      where: { user_id: userId },
    });

    if (!existingStreak) {
      await this.streakRepository.save(
        this.streakRepository.create({
          user_id: userId,
          current_workout_streak: 0,
          best_workout_streak: 0,
        }),
      );
    }

    const updatedUser = await this.getProfile(userId);
    return { user: updatedUser };
  }
}
