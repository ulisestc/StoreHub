export interface Sale {
  id: number;
  user: string;
  client: number | null;
  client_name?: string;
  subtotal: string;
  impuestos: string;
  total: string;
  created_at: string;
  details: SaleDetail[];
}

export interface SaleDetail {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  price_at_sale: string;
}
