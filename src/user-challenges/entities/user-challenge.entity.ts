import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Challenge } from '../../challenges/entities/challenge.entity';
import { ChallengeCompletionStatus } from '../enums/challenge-completion-status.enum';

@Entity('user_challenges')
export class UserChallenge {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the user-challenge association',
  })
  id: number;

  @ManyToOne(() => User, (user) => user.challenges, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Challenge, (challenge) => challenge.userChallenges, {
    onDelete: 'CASCADE',
  })
  challenge: Challenge;

  @Column({
    name: 'completion_status',
    type: 'enum',
    enum: ChallengeCompletionStatus,
    default: ChallengeCompletionStatus.NOT_STARTED,
  })
  @ApiProperty({
    enum: ChallengeCompletionStatus,
    description: 'Completion status of the challenge for the user',
  })
  completionStatus: ChallengeCompletionStatus;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'When the challenge was completed',
    required: false,
  })
  completedAt: Date;

  @Column({ default: 0 })
  @ApiProperty({
    example: 50,
    description: 'Points earned from this challenge',
  })
  earnedPoints: number;

  @CreateDateColumn()
  createdAt: Date;
}
