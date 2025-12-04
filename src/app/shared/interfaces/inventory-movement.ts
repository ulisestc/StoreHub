export interface InventoryMovement {
  id: string;
  product: string; // ID del producto
  type: 'in' | 'out' | 'loss'; // Tipo de movimiento
  quantity: number; // Cantidad
  created_at?: string; // Fecha
}
