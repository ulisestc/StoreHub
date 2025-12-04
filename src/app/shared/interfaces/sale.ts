export interface Sale {
  id: string;
  client: string; // ID del cliente
  details: SaleDetail[]; // Detalles de la venta
  total?: number; // Calculado automáticamente por el backend
  created_at?: string; // Fecha de creación
}

export interface SaleDetail {
  product: string; // ID del producto
  quantity: number; // Cantidad vendida
}
