import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

// Importaciones de Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

// 3. Servicios y Modelos
import { ProductService } from '../../../../services/product.service';
import { Product } from '../../../../shared/interfaces/product';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule
  ],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.scss'
})
export class PosComponent implements OnInit {

  // --- Lógica del Ticket ---
  ticketItems: any[] = [];
  totalVenta: number = 0;

  // --- Lógica de Búsqueda ---
  private productService = inject(ProductService);
  private allProducts: Product[] = []; // Almacenará todos los productos

  // Formulario para el buscador
  searchForm = new FormGroup({
    sku: new FormControl('', [Validators.required])
  });

  // ngOnInit se ejecuta al cargar
  ngOnInit(): void {
    this.loadAllProducts();
  }

  // Carga todos los productos para la búsqueda simulada
  loadAllProducts(): void {
    this.productService.getProducts().subscribe(data => {
      this.allProducts = data;
      console.log('Productos cargados para POS:', this.allProducts);
    });
  }

  // Se llama al presionar Enter en el buscador
  onAddProduct(): void {
    if (this.searchForm.invalid) return;

    const sku = this.searchForm.value.sku;

    // Busca el producto en la lista simulada
    const productFound = this.allProducts.find(p => p.codigo_barras === sku);

    if (productFound) {
      // --- Producto encontrado ---

      // Revisa si el producto ya está en el ticket
      const itemInTicket = this.ticketItems.find(item => item.id === productFound.id);

      if (itemInTicket) {
        // Si ya está, solo aumenta la cantidad
        itemInTicket.cantidad++;
      } else {
        // Si es nuevo, lo añade al ticket
        this.ticketItems.push({
          id: productFound.id,
          nombre: productFound.nombre,
          precio_venta: productFound.precio_venta,
          cantidad: 1
        });
      }

      this.calculateTotal(); // Recalcula el total
      this.searchForm.reset(); // Limpia el buscador

    } else {
      // --- Producto no encontrado ---
      console.warn('Producto no encontrado:', sku);
      this.searchForm.reset();
    }
  }

  // Calcula el total de la venta
  calculateTotal(): void {
    this.totalVenta = this.ticketItems.reduce((acc, item) => {
      return acc + (item.precio_venta * item.cantidad);
    }, 0);
  }

  // Quita un ítem del ticket
  removeItem(index: number): void {
    this.ticketItems.splice(index, 1); // Quita el ítem por su índice
    this.calculateTotal(); // Recalcula el total
  }
}
