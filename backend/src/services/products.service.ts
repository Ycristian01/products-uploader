import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Product } from 'src/db/product.entity';
import { CreateProductDto } from 'src/dtos/product.dto';
import { formatDateToISO } from 'src/helpers/date.helper';
import { ParsedProductsResponseI } from 'src/interfaces/parsed-products-response.interface';
import { Repository } from 'typeorm';
import { ExchangeRatesService } from './exchange-rates.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    private exchangeRatesService: ExchangeRatesService,
  ) {}

  async createProduct(body: CreateProductDto): Promise<Product | undefined> {
    try {
      const product = this.productRepo.create(body);
      const createdProduct = await this.productRepo.save(product);

      await this.exchangeRatesService.createExchangeRates(createdProduct);
      return createdProduct;
    } catch (err) {
      console.warn(`Could not store product ${body.name}. Error:`, err.message);
    }
  }

  async parseProducts(
    rawProducts: ParsedProductsResponseI[],
  ): Promise<CreateProductDto[]> {
    const validProducts: CreateProductDto[] = [];

    for (const rp of rawProducts) {
      try {
        const parsedProduct: CreateProductDto = {
          name: rp.name.replace(/\s*#.*$/, ''),
          price: Number(rp.price.replace('$', '')),
          expiration: formatDateToISO(rp.expiration),
        };
        const dto = plainToInstance(CreateProductDto, parsedProduct);

        const errors = validateSync(dto);
        if (errors.length > 0) {
          console.warn('Invalid product skipped:', rp, errors[0].constraints);
          continue;
        }

        validProducts.push(parsedProduct);
      } catch (err) {
        console.warn('Error parsing product, skipped:', rp, err.message);
        continue;
      }
    }
    return validProducts;
  }
}
