import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { ConfirmSaleModalComponent } from '../../../../modals/confirm-sale-modal/confirm-sale-modal.component';
import { ClientQuickAddModalComponent } from '../../../../modals/client-quick-add-modal/client-quick-add-modal.component';
import { LowStockWarningModalComponent } from '../../../../modals/low-stock-warning-modal/low-stock-warning-modal.component';
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

  ticketItems: any[] = [];
  totalVenta: number = 0;
  allProducts: Product[] = [];
  clients: Client[] = [];
  selectedClientId: string | null = null;
  
  private productService = inject(ProductService);
  private snackBar = inject(MatSnackBar);
  private salesService = inject(SalesService);
  private clientService = inject(ClientService);
  private dialog = inject(MatDialog);
  private LOW_STOCK_THRESHOLD = 5;

  searchForm = new FormGroup({
    sku: new FormControl('', [Validators.required])
  });

  ngOnInit(): void {
    this.loadAllProducts();
    this.loadClients();
  }

  loadAllProducts(): void {
    this.productService.getProducts().subscribe(data => {
      this.allProducts = data;
    });
  }

  loadClients(): void {
    this.clientService.getClients().subscribe(data => {
      this.clients = data;
      const defaultClient = data.find(c => c.nombre.includes('Mostrador'));
      if (defaultClient) {
        this.selectedClientId = defaultClient.id;
      }
    });
  }

  onAddProduct(): void {
    if (this.searchForm.invalid) return;

    const sku = this.searchForm.value.sku;
    const productFound = this.allProducts.find(p => p.codigo_barras === sku);

    if (productFound) {
      const itemInTicket = this.ticketItems.find(item => item.id === productFound.id);
      const cantidadEnTicket = itemInTicket ? itemInTicket.cantidad : 0;

      if (cantidadEnTicket >= productFound.cantidad_stock) {
        this.showError('No hay más stock disponible para este producto.');
        this.searchForm.reset();
        return;
      }

      if (productFound.cantidad_stock <= 0) {
        this.showError('Producto agotado. No se puede añadir.');
        this.searchForm.reset();
        return;
      }

      if (itemInTicket) {
        itemInTicket.cantidad++;
      } else {
        this.ticketItems.push({
          id: productFound.id,
          nombre: productFound.nombre,
          precio_venta: productFound.precio_venta,
          cantidad: 1,
          stock_disponible: productFound.cantidad_stock
        });
      }

      this.calculateTotal();
      this.searchForm.reset();

    } else {
      this.showError('Producto no encontrado con ese SKU.');
      this.searchForm.reset();
    }
  }

  calculateTotal(): void {
    this.totalVenta = this.ticketItems.reduce((acc, item) => {
      return acc + (item.precio_venta * item.cantidad);
    }, 0);
  }

  removeItem(index: number): void {
    this.ticketItems.splice(index, 1);
    this.calculateTotal();
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['snackbar-error']
    });
  }

  onConfirmSale(): void {
    if (this.ticketItems.length === 0) return;

    const dialogRef = this.dialog.open(ConfirmSaleModalComponent, {
      width: '400px',
      data: { total: this.totalVenta }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.processSale();
      }
    });
  }

  private processSale(): void {
    this.salesService.createSale(this.ticketItems, this.totalVenta).subscribe(saleResponse => {
      this.snackBar.open(`Venta #${saleResponse.id} registrada con éxito`, 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-success']
      });

      const productsWithLowStock: any[] = [];
      let itemsProcessed = 0;
      
      this.ticketItems.forEach(item => {
        this.productService.decreaseStock(item.id, item.cantidad).subscribe(() => {
          itemsProcessed++;
          const updatedProduct = this.allProducts.find(p => p.id === item.id);

          if (updatedProduct && updatedProduct.cantidad_stock <= this.LOW_STOCK_THRESHOLD) {
            productsWithLowStock.push(updatedProduct);
          }

          if (itemsProcessed === this.ticketItems.length) {
            this.finishSale(productsWithLowStock);
          }
        });
      });
    });
  }

  openCreateClientDialog(): void {
    const dialogRef = this.dialog.open(ClientQuickAddModalComponent, {
      width: '450px',
    });

    dialogRef.afterClosed().subscribe((newClient: Client | undefined) => {
      if (newClient) {
        this.selectedClientId = newClient.id;
        this.snackBar.open(`Cliente "${newClient.nombre}" creado y seleccionado`, 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  private finishSale(lowStockProducts: any[]): void {
    this.ticketItems = [];
    this.calculateTotal();
    this.loadAllProducts();

    if (lowStockProducts.length > 0) {
      this.dialog.open(LowStockWarningModalComponent, {
        width: '450px',
        data: { products: lowStockProducts }
      });
    }
  }
}