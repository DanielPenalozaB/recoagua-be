import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { City } from 'src/cities/entities/city.entity';

@Entity()
export class Zone {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'The unique identifier of the zone' })
  id: number;

  @Column()
  @ApiProperty({ example: 'Highland Water Zone', description: 'The name of the zone' })
  name: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    example: 'Zone with high rainfall and good water retention',
    description: 'Description of the zone',
    required: false,
  })
  description: string;

  @Column({ type: 'float', nullable: true })
  @ApiProperty({ example: 1200, description: 'Average rainfall in mm', required: false })
  rainfall: number;

  // Split into separate latitude/longitude columns
  @Column({ type: 'decimal', precision: 10, scale: 7, name: 'latitude' })
  @ApiProperty({ example: 4.6097, description: 'Latitude coordinate' })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, name: 'longitude' })
  @ApiProperty({ example: -74.0817, description: 'Longitude coordinate' })
  longitude: number;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    example: 'Use terraces for water retention',
    description: 'Recommendations for this zone',
    required: false,
  })
  recommendations: string;

  @Column()
  @ApiProperty({ example: 'active', description: 'Status of the zone record' })
  status: string;

  @Column({ type: 'float', nullable: true })
  @ApiProperty({
    example: 2600,
    description: 'Altitude in meters above sea level',
    required: false,
  })
  altitude: number;

  @Column({ name: 'soil_type', nullable: true })
  @ApiProperty({ example: 'clay', description: 'Type of soil in the zone', required: false })
  soilType: string;

  @Column({ name: 'avg_temperature', type: 'float', nullable: true })
  @ApiProperty({
    example: 14.5,
    description: 'Average temperature in Celsius',
    required: false,
  })
  avgTemperature: number;

  @ManyToOne(() => City, (city) => city.zones, { onDelete: 'CASCADE' })
  city: City;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp with time zone' })
  deletedAt: Date;
}