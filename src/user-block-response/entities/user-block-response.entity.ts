import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Block } from '../../blocks/entities/block.entity';
import { UserAnswerDetails } from 'src/user-answer-details/entities/user-answer-detail.entity';

@Entity('user_block_responses')
export class UserBlockResponse {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the response',
  })
  id: number;

  @ManyToOne(() => User, (user) => user.blockResponses, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Block, (block) => block.userResponses, {
    onDelete: 'CASCADE',
  })
  block: Block;

  @Column()
  @ApiProperty({
    example: true,
    description: 'Whether the response was correct',
  })
  isCorrect: boolean;

  @Column({
    name: 'submitted_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'When the response was submitted',
  })
  submittedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => UserAnswerDetails, (details) => details.response)
  answerDetails: UserAnswerDetails;
}
