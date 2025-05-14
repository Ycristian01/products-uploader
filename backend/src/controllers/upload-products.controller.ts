import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UNPROCESSED_FILE_MSG } from 'src/common/constants/errors-messages.constants';
import { Product } from 'src/db/product.entity';
import { JsonApiResponse } from 'src/interfaces/json-response.interface';
import { ProductsService } from 'src/services/products.service';
import { UploadProductsService } from 'src/services/upload-products.service';

@Controller('upload-products')
export class UploadProductsController {
  constructor(
    private readonly productsUploadService: UploadProductsService,
    private readonly productsService: ProductsService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<JsonApiResponse> {
    try {
      const data = await this.productsUploadService.handleFileUpload(file);

      const validProducts = await this.productsService.parseProducts(data);

      let storedProducts = await Promise.all(
        validProducts.map((vp) => this.productsService.createProduct(vp)),
      );

      storedProducts = storedProducts.filter(
        (product): product is Product => !!product,
      );

      return {
        status: 200,
        message: `File uploaded and processed successfully. Total products stored: ${storedProducts.length}`,
      };
    } catch (err) {
      console.error('Error processing file:', err);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: UNPROCESSED_FILE_MSG,
          error: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
