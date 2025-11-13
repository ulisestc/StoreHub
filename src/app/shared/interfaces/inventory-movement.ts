export interface InventoryMovement {
  id: string;
  producto: string; // Nombre del producto o ID
  tipo_movimiento: 'entrada' | 'salida' | 'merma';
  cantidad: number;
  usuario: string; // Nombre del admin o ID
  fecha: Date;
}
