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
import { Region } from '../../regions/entities/region.entity';
import { User } from '../../users/entities/user.entity';
import { Zone } from 'src/zone/entities/zone.entity';

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'The unique identifier of the city' })
  id: number;

  @Column()
  @ApiProperty({ example: 'Bogotá', description: 'The name of the city' })
  name: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    example: 'Capital of Colombia',
    description: 'Description of the city',
    required: false,
  })
  description: string;

  @Column({ type: 'float', nullable: true })
  @ApiProperty({
    example: 800,
    description: 'Average rainfall in mm',
    required: false,
  })
  rainfall: number;

  @Column()
  @ApiProperty({
    example: 'es',
    description: 'The language of the city content',
  })
  language: string;

  @ManyToOne(() => Region, (region) => region.cities)
  @ApiProperty({
    type: () => Region,
    description: 'The region this city belongs to',
    required: false,
  })
  region: Region;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => User, (user) => user.city)
  users: User[];

  @OneToMany(() => Zone, (zone) => zone.city)
  zones: Zone[];
}
