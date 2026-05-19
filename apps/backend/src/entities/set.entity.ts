import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('sets')
export class WorkoutSet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  workout_exercise_id: string;

  @Column({ type: 'int' })
  set_number: number;

  @Column({ type: 'int', nullable: true })
  reps: number;

  @Column({ type: 'decimal', precision: 7, scale: 2, nullable: true })
  weight: number;

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  rpe: number;

  @Column({ type: 'int', nullable: true })
  rest_time: number;

  @Column({ type: 'boolean', default: false })
  is_completed: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
