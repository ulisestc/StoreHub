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
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatDialog } from '@angular/material/dialog';
import { ConfirmSaleDialogComponent } from '../confirm-sale-dialog/confirm-sale-dialog.component';

// 3. Servicios y Modelos
import { ProductService } from '../../../../services/product.service';
import { Product } from '../../../../shared/interfaces/product';
import { SalesService } from '../../../../services/sales.service';

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
    MatListModule,
    MatSnackBarModule
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
  private snackBar = inject(MatSnackBar);
  private salesService = inject(SalesService);
  private dialog = inject(MatDialog);

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
    const productFound = this.allProducts.find(p => p.codigo_barras === sku);

    if (productFound) {
      // --- Producto encontrado ---

      // Revisa si el producto ya está en el ticket
      const itemInTicket = this.ticketItems.find(item => item.id === productFound.id);
      const cantidadEnTicket = itemInTicket ? itemInTicket.cantidad : 0;

      // --- VALIDACIÓN DE STOCK  ---
      if (cantidadEnTicket >= productFound.cantidad_stock) {
        // El cajero intenta añadir más de lo que hay en stock
        this.showError('No hay más stock disponible para este producto.');
        this.searchForm.reset();
        return;
      }

      if (productFound.cantidad_stock <= 0) {
        // El producto está agotado
        this.showError('Producto agotado. No se puede añadir.');
        this.searchForm.reset();
        return;
      }
      // --- Fin Validación ---


      if (itemInTicket) {
        // Si ya está, aumenta la cantidad
        itemInTicket.cantidad++;
      } else {
        // Si es nuevo, lo añade al ticket
        this.ticketItems.push({
          id: productFound.id,
          nombre: productFound.nombre,
          precio_venta: productFound.precio_venta,
          cantidad: 1,
          stock_disponible: productFound.cantidad_stock // Guardamos el stock original
        });
      }

      this.calculateTotal();
      this.searchForm.reset();

    } else {
      // --- Producto no encontrado ---
      this.showError('Producto no encontrado con ese SKU.');
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

  // Helper para mostrar notificaciones de error
  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000, // 3 segundos
      panelClass: ['snackbar-error']
    });
  }

  // Método para abrir el diálogo de confirmación
  onConfirmSale(): void {
    if (this.ticketItems.length === 0) return;

    const dialogRef = this.dialog.open(ConfirmSaleDialogComponent, {
      width: '400px',
      data: { total: this.totalVenta } // Pasa el total al diálogo
    });

    // Se suscribe a la respuesta del diálogo
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // ¡Usuario confirmó! Procesamos la venta
        this.processSale();
      }
    });
  }

  // Lógica para procesar la venta (simulada)
  private processSale(): void {
    // a. Llama al servicio de ventas
    this.salesService.createSale(this.ticketItems, this.totalVenta).subscribe(saleResponse => {

      // b. Disminuye el stock de cada producto (¡Importante!)
      this.ticketItems.forEach(item => {
        this.productService.decreaseStock(item.id, item.cantidad).subscribe();
      });

      // c. Muestra éxito y limpia el ticket
      this.snackBar.open(`Venta #${saleResponse.id} registrada con éxito`, 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-success'] // (Clase CSS opcional)
      });

      this.ticketItems = [];
      this.calculateTotal();
      this.loadAllProducts(); // Recarga el stock actualizado de los productos
    });
  }
}
