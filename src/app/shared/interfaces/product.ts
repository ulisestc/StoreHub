export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  cost_price: number;
  is_active: boolean;
  description?: string;
  categoryName?: string;
}
