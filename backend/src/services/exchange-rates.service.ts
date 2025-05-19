import { InjectRepository } from '@nestjs/typeorm';
import { ExchangeRate } from '../db/exchange-rate.entity';
import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Product } from 'src/db/product.entity';
import { ExchangeHttpService } from './exchange-http.service';
import { roundToTwo } from 'src/helpers/math.helper';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { isEmpty } from 'src/helpers/object.helper';

@Injectable()
export class ExchangeRatesService {
  constructor(
    @InjectRepository(ExchangeRate)
    private exchangeRateRepo: Repository<ExchangeRate>,
    private exchangeHttpService: ExchangeHttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createExchangeRates(product: Product): Promise<void> {
    const currencies =
      await this.cacheManager.get<Record<string, number>>('currencies');

    for (const cur in currencies) {
      try {
        const rate = this.exchangeRateRepo.create({
          currency: cur,
          conversion: roundToTwo(product.price * currencies[cur]),
          product,
        });

        await this.exchangeRateRepo.save(rate);
      } catch (err: any) {
        console.warn(
          `Could not store exchange rate with currency: ${cur}. Error:`,
          err?.message,
        );
      }
    }
  }

  async loadCacheCurrencies(): Promise<Record<string, number>> {
    let currencies =
      await this.cacheManager.get<Record<string, number>>('currencies');
    if (!currencies || isEmpty(currencies)) {
      currencies = await this.exchangeHttpService.fetchAPI();
      await this.cacheManager.set('currencies', currencies, 100000);
    }

    return currencies;
  }
}
