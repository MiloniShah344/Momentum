import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('body_measurements')
export class BodyMeasurement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  waist: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  chest: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  arms: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  thighs: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  hips: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  neck: number;

  @Column({ type: 'varchar', length: 10, default: 'cm' })
  unit: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
