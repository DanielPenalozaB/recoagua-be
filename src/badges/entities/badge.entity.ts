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
import { Status } from 'src/common/enums/status.enum';
import { UserBadge } from 'src/user-progress/entities/user-badge.entity';

@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the badge',
  })
  id: number;

  @Column()
  @ApiProperty({ example: 'Water Hero', description: 'The name of the badge' })
  name: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    example: 'Awarded for exceptional water conservation efforts',
    description: 'Description of the badge',
    required: false,
  })
  description: string;

  @Column({ name: 'image_url', nullable: true })
  @ApiProperty({
    example: 'https://example.com/badges/water-hero.png',
    description: 'URL to badge image',
    required: false,
  })
  imageUrl: string;

  @Column({ type: 'text' })
  @ApiProperty({
    example: 'Complete 5 water conservation guides',
    description: 'Requirements to earn this badge',
  })
  requirements: string;

  @Column({ type: 'enum', enum: Status, default: Status.ACTIVE })
  @ApiProperty({ enum: Status, description: 'Status of the badge' })
  status: Status;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => UserBadge, (userBadge) => userBadge.badge)
  userBadges: UserBadge[];
}
