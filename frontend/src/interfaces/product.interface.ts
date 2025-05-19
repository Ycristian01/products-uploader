import type ExchangeRateI from "./exchange-rate.interface";

export default interface ProductI {
  id: string;
  name: string;
  price: number;
  expiration: string;
  exchangeRates: ExchangeRateI[];
}
