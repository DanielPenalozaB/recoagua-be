import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { UserActionType } from '../enums/user-action-type.enum';

@Entity('user_actions')
export class UserAction {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the action',
  })
  id: number;

  @ManyToOne(() => User, (user) => user.actions, { onDelete: 'CASCADE' })
  user: User;

  @Column({ name: 'action_type', type: 'enum', enum: UserActionType })
  @ApiProperty({
    enum: UserActionType,
    description: 'Type of action performed',
  })
  actionType: UserActionType;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    example: 'Completed module on water conservation',
    description: 'Description of the action',
    required: false,
  })
  description: string;

  @Column({
    name: 'performed_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'When the action was performed',
  })
  performedAt: Date;

  @Column({ name: 'ip_address', nullable: true })
  @ApiProperty({
    example: '192.168.1.1',
    description: 'IP address from which the action was performed',
    required: false,
  })
  ipAddress: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
