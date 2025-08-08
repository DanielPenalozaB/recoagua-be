import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('levels')
export class Level {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the level',
  })
  id: number;

  @Column()
  @ApiProperty({
    example: 'Water Guardian',
    description: 'The name of the level',
  })
  name: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    example: 'Achieved by saving significant amounts of water',
    description: 'Description of the level',
    required: false,
  })
  description: string;

  @Column({ name: 'required_points' })
  @ApiProperty({
    example: 500,
    description: 'Points required to reach this level',
  })
  requiredPoints: number;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    example: 'Special avatar frame',
    description: 'Rewards for reaching this level',
    required: false,
  })
  rewards: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
