import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
} from 'src/common/constants/settings.constants';
import { isEmpty } from 'src/helpers/object.helper';

@Injectable()
export class ExchangeHttpService {
  constructor(private readonly httpService: HttpService) {}

  private readonly logger = new Logger(ExchangeHttpService.name);
  private readonly fallbackPaths = ['.min.json', '.json'];
  private readonly defaultCurrency = DEFAULT_CURRENCY;
  private readonly supportedCurrencies = SUPPORTED_CURRENCIES;
  private readonly baseUrls = [
    process.env.EXCHANGE_API,
    process.env.EXCHANGE_API_FALLBACK,
  ];

  /**
   * Fetches exchange rates for the supported currencies relative to the default currency (USD).
   *
   * @returns A record of supported currency codes and their corresponding exchange rates.
   */
  async fetchAPI(): Promise<Record<string, number>> {
    const currencies = await this.loadCurrencies();
    const supportedCurrencies = await this.getSupportedCurrencies(currencies);

    return supportedCurrencies;
  }

  /**
   * Attempts to load exchange rate data from available base URLs and fallback paths.
   *
   * @returns A record of all fetched exchange rates, or an empty object if all attempts fail.
   */
  private async loadCurrencies(): Promise<Record<string, number>> {
    for (const baseUrl of this.baseUrls) {
      for (const suffix of this.fallbackPaths) {
        const url = `${baseUrl}/${this.defaultCurrency}${suffix}`;
        const currencies = await this.fetchAllCurrencies(url);

        if (isEmpty(currencies)) {
          this.logger.debug(`Empty response from ${url}. Trying next...`);
          continue;
        }

        return currencies;
      }
    }

    this.logger.warn('All attempts to fetch currency rates failed.');
    return {};
  }

  /**
   * Fetches currency data from a specific API URL.
   *
   * @param url - The full URL to request currency data from.
   * @returns A record of currency exchange rates, or an empty object on failure.
   */
  private async fetchAllCurrencies(
    url: string,
  ): Promise<Record<string, number>> {
    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.get(url),
      );
      const currencies: Record<string, number> = ({} =
        response.data?.[this.defaultCurrency]);
      return currencies;
    } catch (error) {
      this.logger.debug(`Failed fetching ${url}: ${error.message}`);
      return {};
    }
  }

  /**
   * Filters the full exchange rate data to return only the supported currencies.
   *
   * @param currencies - A record of all fetched exchange rates.
   * @returns A filtered record with only supported currency codes and their rates.
   */
  private async getSupportedCurrencies(
    currencies: Record<string, number>,
  ): Promise<Record<string, number>> {
    const supportedCurrencies: Record<string, number> = {};
    for (const sc of this.supportedCurrencies) {
      supportedCurrencies[sc] = currencies[sc];
    }

    return supportedCurrencies;
  }
}
