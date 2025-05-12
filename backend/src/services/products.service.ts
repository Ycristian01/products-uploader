import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/db/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async createProduct(body: {
    name: string;
    priceUsd: number;
    expirationDate: Date;
  }): Promise<Product> {
    const product = this.productRepo.create(body);
    return await this.productRepo.save(product);
  }
}
