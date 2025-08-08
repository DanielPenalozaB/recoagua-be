import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Module } from '../../modules/entities/module.entity';
import { BlockType } from '../enums/block-type.enum';
import { DynamicType } from '../enums/dynamic-type.enum';
import { QuestionType } from '../enums/question-type.enum';
import { BlockAnswer } from './block-answer.entity';
import { RelationalPair } from './relational-pair.entity';
import { UserBlockResponse } from 'src/user-block-response/entities/user-block-response.entity';

@Entity('blocks')
export class Block {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the block',
  })
  id: number;

  @Column({ type: 'enum', enum: BlockType })
  @ApiProperty({ enum: BlockType, description: 'Type of the content block' })
  type: BlockType;

  @Column()
  @ApiProperty({
    example: 1,
    description: 'Order of the block within the module',
  })
  order: number;

  @Column({ type: 'text' })
  @ApiProperty({
    example: 'What is the water cycle?',
    description: 'Statement or question for the block',
  })
  statement: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    example: 'The water cycle describes how water evaporates...',
    description: 'Additional description',
    required: false,
  })
  description: string;

  @Column({ name: 'resource_url', nullable: true })
  @ApiProperty({
    example: 'https://example.com/video.mp4',
    description: 'URL to external resource',
    required: false,
  })
  resourceUrl: string;

  @Column()
  @ApiProperty({
    example: 10,
    description: 'Points achievable from this block',
  })
  points: number;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    example: 'Good job! You got it right.',
    description: 'Feedback for the user',
    required: false,
  })
  feedback: string;

  @Column({
    name: 'dynamic_type',
    type: 'enum',
    enum: DynamicType,
    nullable: true,
  })
  @ApiProperty({
    enum: DynamicType,
    description: 'Type of interactive dynamic',
    required: false,
  })
  dynamicType: DynamicType;

  @Column({
    name: 'question_type',
    type: 'enum',
    enum: QuestionType,
    nullable: true,
  })
  @ApiProperty({
    enum: QuestionType,
    description: 'Type of question',
    required: false,
  })
  questionType: QuestionType;

  @ManyToOne(() => Module, (module) => module.blocks, { onDelete: 'CASCADE' })
  module: Module;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => BlockAnswer, (answer) => answer.block)
  answers: BlockAnswer[];

  @OneToMany(() => RelationalPair, (pair) => pair.block)
  relationalPairs: RelationalPair[];

  @OneToMany(() => UserBlockResponse, (response) => response.block)
  userResponses: UserBlockResponse[];
}
