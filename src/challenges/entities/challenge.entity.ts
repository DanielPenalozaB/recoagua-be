import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ChallengeDifficulty } from '../enums/challenge-difficult.enum';
import { ChallengeStatus } from '../enums/challenge-status.enum';
import { ChallengeType } from '../enums/challenge-type.enum';
import { UserChallenge } from 'src/user-challenges/entities/user-challenge.entity';

@Entity('challenges')
export class Challenge {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the challenge',
  })
  id: number;

  @Column()
  @ApiProperty({
    example: 'Water Saver',
    description: 'The name of the challenge',
  })
  name: string;

  @Column({ type: 'text' })
  @ApiProperty({
    example: 'Save 100 liters of water in a week',
    description: 'Detailed description of the challenge',
  })
  description: string;

  @Column()
  @ApiProperty({
    example: 50,
    description: 'Points awarded for completing the challenge',
  })
  score: number;

  @Column({ type: 'enum', enum: ChallengeDifficulty })
  @ApiProperty({
    enum: ChallengeDifficulty,
    description: 'Difficulty level of the challenge',
  })
  difficulty: ChallengeDifficulty;

  @Column({
    type: 'enum',
    enum: ChallengeStatus,
    default: ChallengeStatus.DRAFT,
  })
  @ApiProperty({
    enum: ChallengeStatus,
    description: 'Status of the challenge',
  })
  status: ChallengeStatus;

  @Column({ type: 'enum', enum: ChallengeType })
  @ApiProperty({ enum: ChallengeType, description: 'Type of challenge' })
  challengeType: ChallengeType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => UserChallenge, (userChallenge) => userChallenge.challenge)
  userChallenges: UserChallenge[];
}
