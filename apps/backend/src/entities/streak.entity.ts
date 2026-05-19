import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('streaks')
export class Streak {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', unique: true })
  user_id: string;

  @Column({ type: 'int', default: 0 })
  current_workout_streak: number;

  @Column({ type: 'int', default: 0 })
  best_workout_streak: number;

  @Column({ type: 'date', nullable: true })
  last_workout_date: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
