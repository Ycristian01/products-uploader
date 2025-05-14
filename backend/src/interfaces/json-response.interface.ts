export interface JsonApiResponse<T = any> {
  status: number;
  message: string;
  data?: T;
  error?: any;
}
