import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('template_exercises')
export class TemplateExercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  template_id: string;

  @Column({ type: 'uuid' })
  exercise_id: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'int', nullable: true, default: 3 })
  default_sets: number;

  @Column({ type: 'int', nullable: true, default: 10 })
  default_reps: number;

  @Column({
    type: 'decimal',
    precision: 7,
    scale: 2,
    nullable: true,
    default: 0,
  })
  default_weight: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
