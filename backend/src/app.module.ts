import { UploadProductsController } from './controllers/upload-products.controller';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Product } from './db/product.entity';
import { ExchangeRate } from './db/exchange-rate.entity';
import { ProductsService } from './services/products.service';
import { ExchangeRatesService } from './services/exchange-rates.service';
import { ProductsController } from './controllers/products.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UploadProductsService } from './services/upload-products.service';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'db',
      port: 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Product, ExchangeRate]),
  ],
  controllers: [AppController, ProductsController, UploadProductsController],
  providers: [
    AppService,
    ProductsService,
    ExchangeRatesService,
    UploadProductsService,
  ],
})
export class AppModule {}
