import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { scale: 2 })
  priceUsd: number;

  @Column()
  expirationDate: Date;

  @Column()
  createdAt: Date;
}
