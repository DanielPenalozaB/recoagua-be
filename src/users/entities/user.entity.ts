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
import { City } from '../../cities/entities/city.entity';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';
import { UserBadge } from 'src/user-progress/entities/user-badge.entity';
import { UserChallenge } from 'src/user-challenges/entities/user-challenge.entity';
import { UserBlockResponse } from 'src/user-block-response/entities/user-block-response.entity';
import { UserProgress } from 'src/user-progress/entities/user-progress.entity';
import { UserAction } from 'src/user-actions/entities/user-action.entity';
import { Level } from 'src/levels/entities/level.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'The unique identifier of the user' })
  id: number;

  @Column({ type: 'int', default: 0 })
  @ApiProperty({ example: 100, description: 'Total experience points of the user' })
  experience: number;

  @ManyToOne(() => Level, { nullable: true })
  @ApiProperty({ type: () => Level, description: 'Current level of the user' })
  level: Level;

  @Column({ type: 'varchar', unique: true, length: 255 })
  @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({ example: 'John Doe', description: 'The full name of the user' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  password: string | null;

  @Column({ type: 'boolean', default: false })
  passwordSet: boolean;

  @Column({
    type: 'varchar',
    nullable: true,
    select: false,
    length: 255
  })
  passwordResetToken: string | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true
  })
  passwordResetExpires: Date | null;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 255
  })
  emailConfirmationToken: string | null;

  @Column({ type: 'boolean', default: false })
  emailConfirmed: boolean;

  @Column({ type: 'text', nullable: true })
  refreshToken: string | null;

  @Column({ type: 'enum', enum: UserRole, enumName: 'user_role_enum' })
  @ApiProperty({ enum: UserRole, description: 'The role of the user' })
  role: UserRole;

  @ManyToOne(() => City, (city) => city.users, { eager: true })
  @ApiProperty({ type: () => City, description: 'The city associated with the user' })
  city: City;

  @Column({ type: 'varchar', length: 10 })
  @ApiProperty({ example: 'es', description: 'The preferred language of the user' })
  language: string;

  @Column({ type: 'enum', enum: UserStatus, enumName: 'user_status_enum', default: UserStatus.PENDING })
  @ApiProperty({ enum: UserStatus, description: 'The status of the user account' })
  status: UserStatus;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone' })
  deletedAt: Date | null;

  // Relations
  @OneToMany(() => UserProgress, (progress) => progress.user)
  progress: UserProgress[];

  @OneToMany(() => UserBadge, (userBadge) => userBadge.user)
  badges: UserBadge[];

  @OneToMany(() => UserChallenge, (userChallenge) => userChallenge.user)
  challenges: UserChallenge[];

  @OneToMany(() => UserBlockResponse, (response) => response.user)
  blockResponses: UserBlockResponse[];

  @OneToMany(() => UserAction, (action) => action.user)
  actions: UserAction[];
}
