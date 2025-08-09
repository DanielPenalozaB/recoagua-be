import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BlockAnswer } from '../../blocks/entities/block-answer.entity';
import { RelationalPair } from '../../blocks/entities/relational-pair.entity';
import { UserBlockResponse } from 'src/user-block-response/entities/user-block-response.entity';

@Entity('user_answer_details')
export class UserAnswerDetails {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the answer details',
  })
  id: number;

  @ManyToOne(() => UserBlockResponse, (response) => response.answerDetails, {
    onDelete: 'CASCADE',
  })
  response: UserBlockResponse;

  @ManyToOne(() => BlockAnswer, { onDelete: 'SET NULL', nullable: true })
  answer: BlockAnswer;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    example: 'My custom response',
    description: 'Custom text answer',
    required: false,
  })
  customAnswer: string;

  @ManyToOne(() => RelationalPair, { onDelete: 'SET NULL', nullable: true })
  relationalPair: RelationalPair;

  @CreateDateColumn()
  createdAt: Date;
}
