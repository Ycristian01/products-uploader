import { Body, Controller, Post } from '@nestjs/common';
import { Product } from 'src/db/product.entity';
import { ProductsService } from 'src/services/products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Post()
  async create(@Body() data: any): Promise<Product> {
    return this.productService.createProduct(data);
  }
}
