export interface InventoryMovement {
  id: string;
  producto: string;
  tipo_movimiento: 'entrada' | 'salida' | 'merma';
  cantidad: number;
  usuario: string;
  fecha: Date;
  motivo?: string;
}
