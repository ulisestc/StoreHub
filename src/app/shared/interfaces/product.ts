export interface Product {
  id: string;
  nombre: string;
  descripcion?: string;
  codigo_barras: string;
  precio_venta: number;
  costo_adquisicion: number;
  cantidad_stock: number;
  categoria: string;
  estado: 'activo' | 'inactivo';
}
