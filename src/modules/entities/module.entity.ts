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
import { Guide } from '../../guides/entities/guide.entity';
import { Block } from '../../blocks/entities/block.entity';
import { ModuleStatus } from '../enums/module-status.enum';
import { UserProgress } from 'src/user-progress/entities/user-progress.entity';

@Entity('modules')
export class Module {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the module',
  })
  id: number;

  @Column()
  @ApiProperty({
    example: 'Understanding Water Cycle',
    description: 'The name of the module',
  })
  name: string;

  @Column({ type: 'text' })
  @ApiProperty({
    example: 'Learn about the water cycle process',
    description: 'Detailed description of the module',
  })
  description: string;

  @Column()
  @ApiProperty({
    example: 1,
    description: 'Order of the module within the guide',
  })
  order: number;

  @Column()
  @ApiProperty({
    example: 25,
    description: 'Points achievable from this module',
  })
  points: number;

  @Column({ type: 'enum', enum: ModuleStatus, default: ModuleStatus.DRAFT })
  @ApiProperty({
    enum: ModuleStatus,
    description: 'Publication status of the module',
  })
  status: ModuleStatus;

  @ManyToOne(() => Guide, (guide) => guide.modules, { onDelete: 'CASCADE' })
  guide: Guide;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => Block, (block) => block.module)
  blocks: Block[];

  @OneToMany(() => UserProgress, (progress) => progress.module)
  userProgress: UserProgress[];
}
