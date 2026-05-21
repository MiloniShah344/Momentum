import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password_hash: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  display_name: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  current_weight: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  goal_weight: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  fitness_goal: string;

  @Column({ type: 'int', default: 3 })
  workout_frequency_goal: number;

  @Column({ type: 'simple-array', nullable: true })
  preferred_workout_days: string[];

  @Column({ type: 'varchar', length: 100, default: 'UTC' })
  timezone: string;

  @Column({ type: 'varchar', length: 20, default: 'system' })
  theme_preference: string;

  @Column({ type: 'varchar', length: 10, default: 'kg' })
  weight_unit: string;

  @Column({ type: 'varchar', length: 10, default: 'cm' })
  measurement_unit: string;

  @Column({ type: 'boolean', default: false })
  onboarding_complete: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  password_reset_token: string | null;

  @Column({ type: 'timestamp', nullable: true })
  password_reset_expires: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
