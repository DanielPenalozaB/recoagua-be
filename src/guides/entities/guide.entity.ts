import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Module } from '../../modules/entities/module.entity';
import { UserProgress } from '../../user-progress/entities/user-progress.entity';

export enum GuideDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum GuideStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity()
export class Guide {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the guide',
  })
  id: number;

  @Column()
  @ApiProperty({
    example: 'Water Conservation Basics',
    description: 'The name of the guide',
  })
  name: string;

  @Column({ type: 'text' })
  @ApiProperty({
    example: 'Learn the basics of water conservation',
    description: 'Detailed description of the guide',
  })
  description: string;

  @Column({ type: 'enum', enum: GuideDifficulty })
  @ApiProperty({
    enum: GuideDifficulty,
    description: 'Difficulty level of the guide',
  })
  difficulty: GuideDifficulty;

  @Column({ name: 'estimated_duration' })
  @ApiProperty({ example: 60, description: 'Estimated duration in minutes' })
  estimatedDuration: number;

  @Column({ type: 'enum', enum: GuideStatus, default: GuideStatus.DRAFT })
  @ApiProperty({
    enum: GuideStatus,
    description: 'Publication status of the guide',
  })
  status: GuideStatus;

  @Column()
  @ApiProperty({ example: 'es', description: 'Language of the guide content' })
  language: string;

  @Column({ name: 'total_points' })
  @ApiProperty({
    example: 100,
    description: 'Total points achievable from this guide',
  })
  totalPoints: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => Module, (module) => module.guide)
  modules: Module[];

  @OneToMany(() => UserProgress, (progress) => progress.guide)
  userProgress: UserProgress[];
}
