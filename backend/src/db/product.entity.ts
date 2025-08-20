import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ExchangeRate } from './exchange-rate.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  name: string;

  @Column('decimal', { scale: 2 })
  price: number;

  @Column()
  expiration: Date;

  @OneToMany(() => ExchangeRate, (rate) => rate.product, {
    cascade: true,
  })
  exchangeRates: ExchangeRate[];
}
