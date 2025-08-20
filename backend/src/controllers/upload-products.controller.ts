import { ExchangeRatesService } from 'src/services/exchange-rates.service';
import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Product } from 'src/db/product.entity';
import { JsonApiResponse } from 'src/interfaces/json-response.interface';
import { ProductsService } from 'src/services/products.service';
import { UploadProductsService } from 'src/services/upload-products.service';

@Controller('upload-products')
export class UploadProductsController {
  constructor(
    private readonly productsUploadService: UploadProductsService,
    private readonly productsService: ProductsService,
    private readonly exchangeRateService: ExchangeRatesService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<JsonApiResponse> {
    try {
      const data = await this.productsUploadService.handleFileUpload(file);

      const [validProducts] = await Promise.all([
        this.productsService.parseProducts(data),
        this.exchangeRateService.loadCacheCurrencies(),
      ]);

      let storedProducts = await Promise.all(
        validProducts.map((vp) => this.productsService.createProduct(vp)),
      );

      storedProducts = storedProducts.filter(
        (product): product is Product => !!product,
      );

      return {
        status: 200,
        message: `File uploaded and processed. Total products stored: ${storedProducts.length}`,
      };
    } catch (err: any) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: err?.message || 'Failed to retrieve products',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
