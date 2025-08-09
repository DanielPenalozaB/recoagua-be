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

@Entity('relational_pairs')
export class RelationalPair {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'The unique identifier of the pair' })
  id: number;

  @ManyToOne(() => Block, (block) => block.relationalPairs, {
    onDelete: 'CASCADE',
  })
  block: Block;

  @Column({ type: 'text' })
  @ApiProperty({
    example: 'Evaporation',
    description: 'The left item in the pair',
  })
  leftItem: string;

  @Column({ type: 'text' })
  @ApiProperty({
    example: 'Water turns into vapor',
    description: 'The right item in the pair',
  })
  rightItem: string;

  @Column()
  @ApiProperty({
    example: true,
    description: 'Whether this is a correct pairing',
  })
  correctPair: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
