import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Block } from './block.entity';

@Entity('block_answers')
export class BlockAnswer {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the answer',
  })
  id: number;

  @ManyToOne(() => Block, (block) => block.answers, { onDelete: 'CASCADE' })
  block: Block;

  @Column({ type: 'text' })
  @ApiProperty({
    example: 'Evaporation, Condensation, Precipitation',
    description: 'The answer text',
  })
  text: string;

  @Column({ name: 'is_correct' })
  @ApiProperty({ example: true, description: 'Whether this answer is correct' })
  isCorrect: boolean;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    example: 'Correct! These are the main stages.',
    description: 'Feedback for this specific answer',
    required: false,
  })
  feedback: string;

  @Column()
  @ApiProperty({ example: 1, description: 'Order of the answer in the list' })
  order: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
