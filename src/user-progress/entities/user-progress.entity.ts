import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CompletionStatus } from '../enums/completion-status.enum';
import { User } from 'src/users/entities/user.entity';
import { Guide } from 'src/guides/entities/guide.entity';
import { Module } from 'src/modules/entities/module.entity';

@Entity('user_progress')
export class UserProgress {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the progress record',
  })
  id: number;

  @ManyToOne(() => User, (user) => user.progress, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Guide, (guide) => guide.userProgress, {
    onDelete: 'CASCADE',
  })
  guide: Guide;

  @ManyToOne(() => Module, (module) => module.userProgress, {
    onDelete: 'CASCADE',
  })
  module: Module;

  @Column({
    name: 'completion_status',
    type: 'enum',
    enum: CompletionStatus,
    default: CompletionStatus.NOT_STARTED,
  })
  @ApiProperty({
    enum: CompletionStatus,
    description: 'Completion status of the module for the user',
  })
  completionStatus: CompletionStatus;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'When the module was completed',
    required: false,
  })
  completedAt: Date;

  @Column()
  @ApiProperty({ example: 25, description: 'Points earned from this module' })
  earnedPoints: number;

  @CreateDateColumn()
  createdAt: Date;
}
