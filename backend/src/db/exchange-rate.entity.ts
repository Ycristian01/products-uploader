import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ExchangeRate {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  currency: string;

  @Column('decimal', { scale: 2 })
  conversion: number;

  @ManyToOne(() => Product, (product) => product.exchangeRates, {
    onDelete: 'CASCADE',
  })
  product: Product;
}
