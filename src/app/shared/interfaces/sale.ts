export interface Sale {
  id: string;
  fecha: Date;
  usuario: string; // Quién realizó la venta
  items: any[]; // Lista de productos vendidos
  total: number;
}
