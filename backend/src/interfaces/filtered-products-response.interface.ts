import { Product } from 'src/db/product.entity';

export interface FilteredProductsI {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}
