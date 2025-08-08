import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Badge } from '../../badges/entities/badge.entity';

@Entity('user_badges')
export class UserBadge {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the user-badge association',
  })
  id: number;

  @ManyToOne(() => User, (user) => user.badges, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Badge, (badge) => badge.userBadges, { onDelete: 'CASCADE' })
  badge: Badge;

  @Column({
    name: 'earned_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'When the badge was earned',
  })
  earnedAt: Date;
}
