export interface Product {
  id: string;
  name: string;
  sku: string; // código de barras
  price: number; // precio de venta
  stock: number; // cantidad en stock
  category: string; // ID de categoría
  cost_price: number; // precio de costo
}
