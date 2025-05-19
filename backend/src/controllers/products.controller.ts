import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { FilterProductsDto } from 'src/dtos/product.dto';
import { JsonApiResponse } from 'src/interfaces/json-response.interface';
import { ProductsService } from 'src/services/products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Get()
  async findAll(@Query() filters: FilterProductsDto): Promise<JsonApiResponse> {
    try {
      const data = await this.productService.findAndFilterProducts(filters);

      return {
        status: 200,
        data,
      };
    } catch (err: any) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: err?.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
