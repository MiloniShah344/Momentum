import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('prs')
export class PR {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  user_id: string;

  @Index()
  @Column({ type: 'uuid' })
  exercise_id: string;

  @Column({ type: 'decimal', precision: 7, scale: 2 })
  weight: number;

  @Column({ type: 'int' })
  reps: number;

  @Column({ type: 'decimal', precision: 7, scale: 2, nullable: true })
  estimated_1rm: number;

  @Column({ type: 'uuid', nullable: true })
  set_id: string;

  @Column({ type: 'uuid', nullable: true })
  workout_id: string;

  @Column({ type: 'date' })
  achieved_at: string;

  @CreateDateColumn()
  created_at: Date;
}
