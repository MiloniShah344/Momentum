/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workout } from '../entities/workout.entity';
import { Habit } from '../entities/habit.entity';
import { HabitLog } from '../entities/habit-log.entity';
import { WeightLog } from '../entities/weight-log.entity';
import { Streak } from '../entities/streak.entity';
import { Achievement } from '../entities/achievement.entity';
import { UsersService } from '../users/users.service';

const QUOTES = [
  {
    text: "The only bad workout is the one that didn't happen.",
    author: 'Unknown',
  },
  { text: 'It never gets easier. You just get stronger.', author: 'Unknown' },
  {
    text: "Your body can stand almost anything. It's your mind you have to convince.",
    author: 'Unknown',
  },
  {
    text: "Don't count the days. Make the days count.",
    author: 'Muhammad Ali',
  },
  {
    text: 'The clock is ticking. Are you becoming the person you want to be?',
    author: 'Greg Plitt',
  },
  {
    text: 'What seems impossible today will one day become your warm-up.',
    author: 'Unknown',
  },
  {
    text: "Champions aren't made in gyms. They're made from something deep inside.",
    author: 'Muhammad Ali',
  },
  { text: 'Sweat is just fat crying.', author: 'Unknown' },
  {
    text: 'Pain is temporary. Quitting lasts forever.',
    author: 'Lance Armstrong',
  },
  {
    text: 'Your only competition is who you were yesterday.',
    author: 'Unknown',
  },
  { text: 'The body achieves what the mind believes.', author: 'Unknown' },
  {
    text: 'Motivation gets you started. Habit keeps you going.',
    author: 'Jim Ryun',
  },
  {
    text: 'Small daily improvements over time lead to stunning results.',
    author: 'Robin Sharma',
  },
  {
    text: 'Success usually comes to those who are too busy to be looking for it.',
    author: 'Henry David Thoreau',
  },
  {
    text: "If you want something you've never had, you must do something you've never done.",
    author: 'Unknown',
  },
  {
    text: "Take care of your body. It's the only place you have to live.",
    author: 'Jim Rohn',
  },
  {
    text: 'The difference between try and triumph is a little umph.',
    author: 'Marvin Phillips',
  },
  {
    text: 'Excellence is not a destination but a continuous journey.',
    author: 'Brian Tracy',
  },
  { text: "You don't have to be extreme. Just consistent.", author: 'Unknown' },
  {
    text: "Fitness is not about being better than someone else. It's about being better than you used to be.",
    author: 'Unknown',
  },
  {
    text: 'Energy and persistence conquer all things.',
    author: 'Benjamin Franklin',
  },
  {
    text: "Hard work beats talent when talent doesn't work hard.",
    author: 'Tim Notke',
  },
  {
    text: 'Believe in yourself and all that you are.',
    author: 'Christian D. Larson',
  },
  {
    text: 'The secret of getting ahead is getting started.',
    author: 'Mark Twain',
  },
  { text: 'One workout at a time. One day at a time.', author: 'Unknown' },
  {
    text: 'Push harder than yesterday if you want a different tomorrow.',
    author: 'Unknown',
  },
  { text: "You don't find willpower. You build it.", author: 'Unknown' },
  {
    text: 'The pain you feel today will be the strength you feel tomorrow.',
    author: 'Unknown',
  },
  {
    text: 'Discipline is choosing between what you want now and what you want most.',
    author: 'Unknown',
  },
  {
    text: 'Be the hardest worker in every room you walk into.',
    author: 'Dwayne Johnson',
  },
];

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Workout)
    private workoutRepo: Repository<Workout>,

    @InjectRepository(Habit)
    private habitRepo: Repository<Habit>,

    @InjectRepository(HabitLog)
    private habitLogRepo: Repository<HabitLog>,

    @InjectRepository(WeightLog)
    private weightLogRepo: Repository<WeightLog>,

    @InjectRepository(Streak)
    private streakRepo: Repository<Streak>,

    @InjectRepository(Achievement)
    private achievementRepo: Repository<Achievement>,

    private usersService: UsersService,
  ) {}

  // ── Date helpers ──────────────────────────────────────────────

  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getWeekStart(): string {
    const now = new Date();
    const day = now.getUTCDay(); // 0=Sun
    const daysToMonday = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setUTCDate(now.getUTCDate() - daysToMonday);
    monday.setUTCHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
  }

  private getDailyQuote() {
    const start = new Date(new Date().getFullYear(), 0, 0);
    const diff = Date.now() - start.getTime();
    const dayOfYear = Math.floor(diff / 86_400_000);
    return QUOTES[dayOfYear % QUOTES.length];
  }

  // ── Main endpoint ─────────────────────────────────────────────

  async getDashboard(userId: string) {
    const today = this.getToday();
    const weekStart = this.getWeekStart();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    // Run all queries in parallel
    const [
      user,
      streak,
      weeklyCount,
      recentWorkoutDates,
      todayWorkout,
      habits,
      todayLogs,
      latestWeight,
      olderWeight,
      recentAchievement,
    ] = await Promise.all([
      this.usersService.findById(userId),

      this.streakRepo.findOne({ where: { user_id: userId } }),

      // Workouts completed this week
      this.workoutRepo
        .createQueryBuilder('w')
        .where('w.user_id = :userId', { userId })
        .andWhere('w.date >= :weekStart', { weekStart })
        .andWhere('w.date <= :today', { today })
        .andWhere('w.status = :status', { status: 'completed' })
        .getCount(),

      this.workoutRepo
        .createQueryBuilder('w')
        .select('DISTINCT w.date', 'date')
        .where('w.user_id = :userId', { userId })
        .andWhere('w.date >= :start', {
          start: (() => {
            const d = new Date();
            d.setDate(d.getDate() - 27);
            return d.toISOString().split('T')[0];
          })(),
        })
        .andWhere('w.status = :status', { status: 'completed' })
        .getRawMany(),

      // Today's completed workout
      this.workoutRepo.findOne({
        where: { user_id: userId, date: today, status: 'completed' },
      }),

      // All enabled habits
      this.habitRepo.find({
        where: { user_id: userId, is_enabled: true },
        order: { created_at: 'ASC' },
      }),

      // Today's habit logs
      this.habitLogRepo.find({
        where: { user_id: userId, date: today },
      }),

      // Most recent weight log
      this.weightLogRepo.findOne({
        where: { user_id: userId },
        order: { date: 'DESC' },
      }),

      // Weight log from ~7 days ago for trend
      this.weightLogRepo
        .createQueryBuilder('wl')
        .where('wl.user_id = :userId', { userId })
        .andWhere('wl.date <= :date', { date: sevenDaysAgoStr })
        .orderBy('wl.date', 'DESC')
        .getOne(),

      // Most recent achievement
      this.achievementRepo.findOne({
        where: { user_id: userId },
        order: { unlocked_at: 'DESC' },
      }),
    ]);

    // ── Assemble habits with completion status ──
    const completedHabitIds = new Set(
      todayLogs.filter((l) => l.is_completed).map((l) => l.habit_id),
    );

    const habitsWithStatus = habits.map((h) => ({
      id: h.id,
      name: h.name,
      type: h.type,
      is_completed: completedHabitIds.has(h.id),
    }));

    // ── Weekly progress ──
    const weeklyTarget = user?.workout_frequency_goal ?? 3;
    const consistencyPct =
      weeklyTarget > 0
        ? Math.min(Math.round((weeklyCount / weeklyTarget) * 100), 100)
        : 0;

    // ── Weight trend ──
    let weightData;
    if (latestWeight) {
      let trend: 'up' | 'down' | 'neutral' | null = null;
      let change: number | null = null;

      if (olderWeight && olderWeight.id !== latestWeight.id) {
        const diff = Number(latestWeight.weight) - Number(olderWeight.weight);
        change = Math.abs(Number(diff.toFixed(1)));
        trend = diff > 0.1 ? 'up' : diff < -0.1 ? 'down' : 'neutral';
      }

      weightData = {
        latest: Number(latestWeight.weight),
        unit: latestWeight.unit,
        trend,
        change,
      };
    }

    return {
      user: {
        display_name: user?.display_name ?? null,
        fitness_goal: user?.fitness_goal ?? null,
        onboarding_complete: user?.onboarding_complete ?? false,
      },
      streak: {
        current: streak?.current_workout_streak ?? 0,
        best: streak?.best_workout_streak ?? 0,
      },
      weekly: {
        completed: weeklyCount,
        target: weeklyTarget,
        consistency_pct: consistencyPct,
      },
      today: {
        workout_done: !!todayWorkout,
        date: today,
      },
      activity_dates: recentWorkoutDates.map((r: { date: string }) => r.date),
      habits: habitsWithStatus,
      weight: weightData,
      quote: this.getDailyQuote(),
      recent_achievement: recentAchievement
        ? {
            title: recentAchievement.title,
            unlocked_at: recentAchievement.unlocked_at,
          }
        : null,
    };
  }
}
