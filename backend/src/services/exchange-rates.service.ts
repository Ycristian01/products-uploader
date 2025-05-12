import { InjectRepository } from '@nestjs/typeorm';
import { ExchangeRate } from '../db/exchange-rate.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Product } from 'src/db/product.entity';

@Injectable()
export class ExchangeRatesService {
  constructor(
    @InjectRepository(ExchangeRate)
    private exchangeRateRepo: Repository<ExchangeRate>,
  ) {}

  async createExchangeRate(body: {
    currency: string;
    conversion: number;
    product: Product;
  }): Promise<ExchangeRate> {
    const exchangeRate = this.exchangeRateRepo.create(body);

    return await this.exchangeRateRepo.save(exchangeRate);
  }
}
