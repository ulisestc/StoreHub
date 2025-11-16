import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormsModule } from '@angular/forms';

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
import { ConfirmSaleModalComponent } from '../../../../modals/confirm-sale-modal/confirm-sale-modal.component';
import { MatSelectModule } from '@angular/material/select';
import { ClientQuickAddModalComponent } from '../../../../modals/client-quick-add-modal/client-quick-add-modal.component';
import { LowStockWarningModalComponent } from '../../../../modals/low-stock-warning-modal/low-stock-warning-modal.component';

// 3. Servicios y Modelos
import { ProductService } from '../../../../services/product.service';
import { Product } from '../../../../shared/interfaces/product';
import { SalesService } from '../../../../services/sales.service';
import { ClientService } from '../../../../services/client.service';
import { Client } from '../../../../shared/interfaces/client';

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
    MatSnackBarModule,
    MatSelectModule,
    FormsModule
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

  // Define el umbral de stock bajo
  private LOW_STOCK_THRESHOLD = 5;

  // --- Lógica de Clientes ---
  clients: Client[] = [];
  selectedClientId: string | null = null; // Guardará el ID del cliente

  private clientService = inject(ClientService);

  // Formulario para el buscador
  searchForm = new FormGroup({
    sku: new FormControl('', [Validators.required])
  });

  // ngOnInit se ejecuta al cargar
  ngOnInit(): void {
    this.loadAllProducts();
    this.loadClients();
  }

  // Carga todos los productos para la búsqueda simulada
  loadAllProducts(): void {
    this.productService.getProducts().subscribe(data => {
      this.allProducts = data;
      console.log('Productos cargados para POS:', this.allProducts);
    });
  }

  // Método para cargar clientes
  loadClients(): void {
    this.clientService.getClients().subscribe(data => {
      this.clients = data;
      // Selecciona "Cliente Mostrador" por defecto
      const defaultClient = data.find(c => c.nombre.includes('Mostrador'));
      if (defaultClient) {
        this.selectedClientId = defaultClient.id;
      }
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

    const dialogRef = this.dialog.open(ConfirmSaleModalComponent, {
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
    // --- Lógica del cliente implementada (Se conserva) ---
    const selectedClient = this.clients.find(c => c.id === this.selectedClientId);

    console.log('Venta asociada al cliente:', selectedClient?.nombre);

    // (La lógica de salesService.createSale() debería actualizarse para
    // aceptar el ID del cliente, pero por ahora solo lo mostramos en consola)
    // --- Fin de la implementación ---

    // a. Llama al servicio de ventas
    this.salesService.createSale(this.ticketItems, this.totalVenta).subscribe(saleResponse => {

      // --- INICIO DEL NUEVO CÓDIGO ---
      // La lógica de "b." y "c." del código anterior se reemplaza por esto:

      this.snackBar.open(`Venta #${saleResponse.id} registrada con éxito`, 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-success']
      });

      // Array para guardar productos con stock bajo
      const productsWithLowStock: any[] = [];

      // b. Disminuye el stock (usamos un contador para saber cuándo terminamos)
      let itemsProcessed = 0;
      this.ticketItems.forEach(item => {

        this.productService.decreaseStock(item.id, item.cantidad).subscribe(() => {
          itemsProcessed++;

          // Busca el producto actualizado (para saber su nuevo stock)
          const updatedProduct = this.allProducts.find(p => p.id === item.id);

          if (updatedProduct && updatedProduct.cantidad_stock <= this.LOW_STOCK_THRESHOLD) {
            // Si el nuevo stock está por debajo del umbral, lo añadimos a la lista
            productsWithLowStock.push(updatedProduct);
          }

          // Si ya procesamos todos los items...
          if (itemsProcessed === this.ticketItems.length) {
            this.finishSale(productsWithLowStock);
          }
        });
      });
      // --- FIN DEL NUEVO CÓDIGO ---

    });
  }

  // Método para abrir el diálogo de alta rápida
  openCreateClientDialog(): void {
    const dialogRef = this.dialog.open(ClientQuickAddModalComponent, {
      width: '450px',
    });

    // 5. Se suscribe a la respuesta del diálogo
    dialogRef.afterClosed().subscribe((newClient: Client | undefined) => {
      if (newClient) {
        // Si se creó un nuevo cliente, lo añade a la lista y lo selecciona
        this.selectedClientId = newClient.id;

        this.snackBar.open(`Cliente "${newClient.nombre}" creado y seleccionado`, 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  // Método para limpiar y mostrar el modal
  private finishSale(lowStockProducts: any[]): void {
    // Limpia el ticket y recarga
    this.ticketItems = [];
    this.calculateTotal();
    this.loadAllProducts(); // Recarga el stock actualizado de los productos

    // Si hay productos con stock bajo, muestra el modal
    if (lowStockProducts.length > 0) {
      this.dialog.open(LowStockWarningModalComponent, {
        width: '450px',
        data: { products: lowStockProducts }
      });
    }
  }
}
