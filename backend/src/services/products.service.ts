import { FilterProductsDto } from './../dtos/product.dto';
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
import { FilteredProductsI } from 'src/interfaces/filtered-products-response.interface';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    private exchangeRatesService: ExchangeRatesService,
  ) {}

  /**
   * Stores a new product in the database.
   * Also triggers the creation of 5 associated exchange rates.
   *
   * @param body - The product data (name, price, expiration) as a DTO.
   * @returns The created product, or `undefined` if an error occurs.
   */
  async createProduct(body: CreateProductDto): Promise<Product | undefined> {
    try {
      const product = this.productRepo.create(body);
      const createdProduct = await this.productRepo.save(product);

      await this.exchangeRatesService.createExchangeRates(createdProduct);
      return createdProduct;
    } catch (err: any) {
      console.warn(
        `Could not store product ${body.name}. Error:`,
        err?.message,
      );
    }
  }

  /**
   * Parses an array of raw product inputs from the CSV file into validated DTOs.
   * Invalid entries are skipped.
   *
   * @param rawProducts - Raw product data from the extracted csv. Can contains invalid data.
   * @returns An array of valid `CreateProductDto` instances ready for saving.
   */
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
      } catch (err: any) {
        console.warn('Error parsing product, skipped:', rp, err?.message);
        continue;
      }
    }
    return validProducts;
  }

  /**
   * Retrieves and filters products from the database.
   * Supports pagination, name/price/expiration filters, and sorting.
   * Also includes related exchange-rates in the result.
   *
   * @param filters - Optional filters and pagination parameters.
   * @returns A paginated list of filtered products with exchange-rate data.
   */
  async findAndFilterProducts(
    filters: FilterProductsDto,
  ): Promise<FilteredProductsI> {
    const query = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.exchangeRates', 'exchangeRate')
      .addOrderBy('exchangeRate.currency', 'ASC');

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    query.skip((page - 1) * limit).take(limit);

    if (filters.name)
      query.andWhere('product.name ILIKE :name', { name: `%${filters.name}%` });

    if (filters.minPrice)
      query.andWhere('product.price >= :minPrice', {
        minPrice: filters.minPrice,
      });

    if (filters.maxPrice)
      query.andWhere('product.price <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });

    if (filters.minExpiration)
      query.andWhere('product.expiration >= :minExpiration', {
        minExpiration: filters.minExpiration,
      });

    if (filters.maxExpiration)
      query.andWhere('product.expiration <= :maxExpiration', {
        maxExpiration: filters.maxExpiration,
      });

    if (filters.sortBy)
      query.orderBy(
        `product.${filters.sortBy}`,
        (filters.order ?? 'asc').toUpperCase() as 'ASC' | 'DESC',
      );

    const [products, total] = await query.getManyAndCount();
    return {
      products,
      total,
      page,
      limit,
    };
  }
}
