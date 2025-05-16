import { InjectRepository } from '@nestjs/typeorm';
import { ExchangeRate } from '../db/exchange-rate.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Product } from 'src/db/product.entity';
import { ExchangeHttpService } from './exchange-http.service';
import { roundToTwo } from 'src/helpers/math.helper';

@Injectable()
export class ExchangeRatesService {
  constructor(
    @InjectRepository(ExchangeRate)
    private exchangeRateRepo: Repository<ExchangeRate>,
    private exchangeHttpService: ExchangeHttpService,
  ) {}

  async createExchangeRates(product: Product): Promise<any> {
    const currencies = await this.exchangeHttpService.fetchAPI(); // TODO: implement cache settings
    const storedRates: ExchangeRate[] = [];

    for (const cur in currencies) {
      try {
        const rate = this.exchangeRateRepo.create({
          currency: cur,
          conversion: roundToTwo(product.price * currencies[cur]),
          product,
        });

        const createdRate = await this.exchangeRateRepo.save(rate);
        storedRates.push(createdRate);
      } catch (err) {
        console.warn(
          `Could not store exchange rate with currency: ${cur}. Error:`,
          err.message,
        );
      }
    }
  }
}
