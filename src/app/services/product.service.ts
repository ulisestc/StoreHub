import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../shared/interfaces/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  // Datos simulados (Mock Data)
  private mockProducts: Product[] = [
    {
      id: '1',
      nombre: 'Laptop Pro 15"',
      codigo_barras: 'LP15PRO',
      precio_venta: 1500,
      costo_adquisicion: 1000,
      cantidad_stock: 25,
      categoria: 'Electrónica',
      estado: 'activo'
    },
    {
      id: '2',
      nombre: 'Mouse Inalámbrico',
      codigo_barras: 'MOUSE-WL',
      precio_venta: 40,
      costo_adquisicion: 20,
      cantidad_stock: 150,
      categoria: 'Accesorios',
      estado: 'activo'
    },
    {
      id: '3',
      nombre: 'Teclado Mecánico',
      codigo_barras: 'KEY-MECH',
      precio_venta: 120,
      costo_adquisicion: 70,
      cantidad_stock: 0, // Stock crítico
      categoria: 'Accesorios',
      estado: 'inactivo'
    }
  ];

  constructor() { }

  // Método para obtener productos (simulado)
  getProducts(): Observable<Product[]> {
    // 'of()' crea un Observable que emite la lista de productos
    return of(this.mockProducts);
  }

  // Método para obtener un producto por ID (simulado)
  getProductById(id: string): Observable<Product | undefined> {
    // Buscamos el producto en nuestro array simulado
    const product = this.mockProducts.find(p => p.id === id);

    // Devolvemos el producto (o undefined si no se encuentra) como un Observable
    return of(product);
  }

  // Método para borrar un producto (simulado)
  deleteProduct(id: string): Observable<boolean> {
    // Encontramos el índice del producto
    const index = this.mockProducts.findIndex(p => p.id === id);

    if (index > -1) {
      // Si existe, lo quitamos del array
      this.mockProducts.splice(index, 1);
      return of(true); // Devuelve 'true' (éxito)
    }

    return of(false); // Devuelve 'false' (no encontrado)
  }
}
