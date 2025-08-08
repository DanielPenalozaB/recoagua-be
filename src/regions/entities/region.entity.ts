import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { City } from '../../cities/entities/city.entity';

@Entity('regions')
export class Region {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the region',
  })
  id: number;

  @Column()
  @ApiProperty({ example: 'Andina', description: 'The name of the region' })
  name: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    example: 'Region with high mountains',
    description: 'Description of the region',
    required: false,
  })
  description: string;

  @Column()
  @ApiProperty({
    example: 'es',
    description: 'The language of the region content',
  })
  language: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => City, (city) => city.region)
  cities: City[];
}
