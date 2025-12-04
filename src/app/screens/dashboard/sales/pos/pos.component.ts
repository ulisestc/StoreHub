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
import { Category } from '../../../../shared/interfaces/category';
import { CategoryService } from '../../../../services/category.service';

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
  filteredProducts: Product[] = [];
  clients: Client[] = [];
  selectedClientId: string | null = null;
  searchQuery: string = '';
  categories: Category[] = [];
  selectedCategoryId: string | undefined = undefined;

  // Inyecciones
  private productService = inject(ProductService);
  private snackBar = inject(MatSnackBar);
  private salesService = inject(SalesService);
  private clientService = inject(ClientService);
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);
  private LOW_STOCK_THRESHOLD = 5;

  searchForm = new FormGroup({
    sku: new FormControl('', [Validators.required])
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
    this.loadClients();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  loadProducts(): void {
    console.log('Iniciando carga de productos...');
    this.productService.getProducts(this.searchQuery, this.selectedCategoryId).subscribe({
      next: (data) => {
        console.log(' Respuesta del servidor:', data);
        console.log('Tipo de dato recibido:', typeof data);
        console.log('Es array?:', Array.isArray(data));
        // Asegurar que data sea un array
        this.allProducts = Array.isArray(data) ? data : [];
        this.filteredProducts = this.allProducts;
        console.log('Productos cargados:', this.allProducts.length);
      },
      error: (error) => {
        console.error('Error cargando productos:', error);
        console.error('Detalles del error:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        this.allProducts = [];
        this.filteredProducts = [];
        this.showError('Error al cargar los productos');
      }
    });
  }

  onSearchChange(): void {
    this.loadProducts();
  }

  onCategoryChange(): void {
    this.loadProducts();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategoryId = undefined;
    this.loadProducts();
  }

  loadClients(): void {
    console.log('🔍 Iniciando carga de clientes...');
    this.clientService.getClients().subscribe({
      next: (data) => {
        console.log('✅ Respuesta clientes:', data);
        console.log('📊 Tipo de dato recibido:', typeof data);
        console.log('📦 Es array?:', Array.isArray(data));
        // Asegurar que data sea un array
        this.clients = Array.isArray(data) ? data : [];
        console.log('🎯 Clientes cargados:', this.clients.length);
        const defaultClient = this.clients.find(c => c.name.includes('Mostrador'));
        if (defaultClient) {
          this.selectedClientId = defaultClient.id;
          console.log('✅ Cliente por defecto seleccionado:', defaultClient.name);
        }
      },
      error: (error) => {
        console.error('❌ Error cargando clientes:', error);
        console.error('📄 Detalles del error:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        this.clients = [];
      }
    });
  }

  filterProducts(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredProducts = this.allProducts;
    } else {
      this.filteredProducts = this.allProducts.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query)
      );
    }
  }

  addProductToTicket(product: Product): void {
    const itemInTicket = this.ticketItems.find(item => item.id === product.id);
    const cantidadEnTicket = itemInTicket ? itemInTicket.cantidad : 0;

    if (cantidadEnTicket >= product.stock) {
      this.showError('No hay más stock disponible para este producto.');
      return;
    }

    if (product.stock <= 0) {
      this.showError('Producto agotado. No se puede añadir.');
      return;
    }

    if (itemInTicket) {
      itemInTicket.cantidad++;
    } else {
      this.ticketItems.push({
        id: product.id,
        sku: product.sku,
        nombre: product.name,
        precio_venta: product.price,
        cantidad: 1,
        stock_disponible: product.stock
      });
    }

    this.calculateTotal();
    this.showSuccess(`${product.name} agregado al ticket`);
    console.log (this.ticketItems);
  }

  onAddProduct(): void {
    if (this.searchForm.invalid) return;

    const sku = this.searchForm.value.sku;
    const productFound = this.allProducts.find(p => p.sku === sku);

    if (productFound) {
      const itemInTicket = this.ticketItems.find(item => item.id === productFound.id);
      const cantidadEnTicket = itemInTicket ? itemInTicket.cantidad : 0;

      if (cantidadEnTicket >= productFound.stock) {
        this.showError('No hay más stock disponible para este producto.');
        this.searchForm.reset();
        return;
      }

      if (productFound.stock <= 0) {
        this.showError('Producto agotado. No se puede añadir.');
        this.searchForm.reset();
        return;
      }

      if (itemInTicket) {
        itemInTicket.cantidad++;
      } else {
        this.ticketItems.push({
          id: productFound.id,
          sku: productFound.sku,
          nombre: productFound.name,
          precio_venta: productFound.price,
          cantidad: 1,
          stock_disponible: productFound.stock
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

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 2000,
      panelClass: ['snackbar-success']
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
    // Transformar ticketItems al formato que espera el backend
    const saleDetails = this.ticketItems.map(item => ({
      product: item.id,
      quantity: item.cantidad
    }));

    const saleData = {
      client: this.selectedClientId || '',
      details: saleDetails
    };

    this.salesService.createSale(saleData).subscribe(saleResponse => {
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

          if (updatedProduct && updatedProduct.stock <= this.LOW_STOCK_THRESHOLD) {
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
        this.snackBar.open(`Cliente "${newClient.name}" creado y seleccionado`, 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  private finishSale(lowStockProducts: any[]): void {
    this.ticketItems = [];
    this.calculateTotal();
    this.loadProducts();

    if (lowStockProducts.length > 0) {
      this.dialog.open(LowStockWarningModalComponent, {
        width: '450px',
        data: { products: lowStockProducts }
      });
    }
  }
}
