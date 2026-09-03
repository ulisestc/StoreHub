import { Component, OnInit, inject, HostListener } from '@angular/core';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmSaleModalComponent } from '../../../../modals/confirm-sale-modal/confirm-sale-modal.component';
import { ClientQuickAddModalComponent } from '../../../../modals/client-quick-add-modal/client-quick-add-modal.component';
import { LowStockWarningModalComponent } from '../../../../modals/low-stock-warning-modal/low-stock-warning-modal.component';
import { SaleSuccessModalComponent } from '../../../../modals/sale-success-modal/sale-success-modal.component';
import { HardwareSettingsModalComponent } from '../../../../modals/hardware-settings-modal/hardware-settings-modal.component';
import { ProductService } from '../../../../services/product.service';
import { CategoryService } from '../../../../services/category.service';
import { Product } from '../../../../shared/interfaces/product';
import { Category } from '../../../../shared/interfaces/category';
import { SalesService } from '../../../../services/sales.service';
import { ClientService } from '../../../../services/client.service';
import { Client } from '../../../../shared/interfaces/client';
import { OfflineSyncService } from '../../../../services/offline-sync.service';
import { AnalyticsService, MarketBasketRule } from '../../../../services/analytics.service';
import { AuthService } from '../../../../services/auth.service';
import { CashRegisterService } from '../../../../services/cash-register.service';
import { CashRegisterDialogComponent } from '../../../../components/cash-register-dialog/cash-register-dialog.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Router } from '@angular/router';

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
    MatProgressSpinnerModule,
    MatPaginatorModule,
    FormsModule,
    ZXingScannerModule,
    MatTooltipModule
  ],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.scss'
})
export class PosComponent implements OnInit {

  ticketItems: any[] = [];
  totalVenta: number = 0;
  subtotalVenta: number = 0;
  ivaVenta: number = 0;
  filteredProducts: Product[] = [];
  clients: Client[] = [];
  categories: Category[] = [];
  selectedClientId: string | null = null;
  selectedCategoryId: string | undefined = undefined;
  searchQuery: string = '';
  isLoading = false;
  isOnline: boolean = true;
  pageSize = 10;
  currentPage = 0;
  totalProducts = 0;

  marketBasketRules: MarketBasketRule[] = [];
  currentSuggestion: { productName: string, confidence: number, price?: number } | null = null;
  isPremium: boolean = false;

  allowedFormats = [ BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13, BarcodeFormat.CODE_128, BarcodeFormat.UPC_A ];
  cameraEnabled = false;
  isCheckingCamera = false;
  
  // Physical Scanner Buffer
  private barcodeBuffer = '';
  private lastScanTime = 0;
  private lastSuccessScanTime = 0;
  lastScannedCode = '';

  hasDevices = false;
  availableDevices: MediaDeviceInfo[] = [];
  currentDevice: MediaDeviceInfo | undefined = undefined;

  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private snackBar = inject(MatSnackBar);
  private salesService = inject(SalesService);
  private clientService = inject(ClientService);
  private offlineSyncService = inject(OfflineSyncService);
  private analyticsService = inject(AnalyticsService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private cashRegisterService = inject(CashRegisterService);
  private router = inject(Router);
  isCashRegisterOpen: boolean = false;
  LOW_STOCK_THRESHOLD = 5;
  private searchSubject = new Subject<string>();

  searchForm = new FormGroup({
    sku: new FormControl('', [Validators.required])
  });

  ngOnInit(): void {
    this.checkCashRegisterStatus();
    this.loadAllProducts();
    this.loadClients();
    this.loadCategories();
    this.isPremium = this.authService.isPremium();
    this.offlineSyncService.isOnline.subscribe(online => {
      this.isOnline = online;
      if (this.isOnline && this.isPremium) {
        this.loadMarketBasketRules();
      }
    });

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchQuery = searchTerm;
      this.currentPage = 0;
      this.loadAllProducts(0);
    });
  }

  checkCashRegisterStatus(): void {
    if (!navigator.onLine) {
      this.isCashRegisterOpen = true;
      return;
    }

    this.cashRegisterService.getCurrentSession().subscribe({
      next: (session) => {
        this.isCashRegisterOpen = !!session;
        if (!this.isCashRegisterOpen) {
          this.promptOpenCashRegister();
        }
      },
      error: (err) => {
        if (err.status === 0 || err.status === 502 || err.status === 504 || err.status === 500 || !this.isOnline) {
          // Network error or Proxy Gateway Timeout: assume register is open to allow offline sales
          this.isCashRegisterOpen = true;
        } else {
          this.isCashRegisterOpen = false;
          this.promptOpenCashRegister();
        }
      }
    });
  }

  private promptOpenCashRegister(): void {
    const dialogRef = this.dialog.open(CashRegisterDialogComponent, {
      width: '450px',
      disableClose: true,
      data: { action: 'open' }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isCashRegisterOpen = true;
        this.showSuccess('Caja abierta exitosamente. Listo para cobrar.');
      } else {
        // Redirect to dashboard if they refuse to open the register
        this.router.navigate(['/dashboard']);
      }
    });
  }

  loadMarketBasketRules(): void {
    this.analyticsService.getMarketBasket().subscribe({
      next: (rules) => this.marketBasketRules = rules || [],
      error: (err) => console.log('Could not load market basket rules', err)
    });
  }

  loadAllProducts(pageIndex: number = 0): void {
    this.isLoading = true;
    const backendPage = pageIndex + 1;
    console.log('Iniciando carga de productos...');

    // Fast-path offline: servir directamente desde caché sin pasar por HTTP/interceptors
    const isOffline = !navigator.onLine || localStorage.getItem('storehub_is_offline') === 'true';
    if (isOffline) {
      const cached = localStorage.getItem('storehub_offline_catalog');
      if (cached) {
        try {
          let catalog: any[] = JSON.parse(cached);

          if (this.searchQuery) {
            const s = this.searchQuery.toLowerCase();
            catalog = catalog.filter((p: any) =>
              p.name.toLowerCase().includes(s) ||
              p.sku.toLowerCase().includes(s)
            );
          }
          if (this.selectedCategoryId) {
            catalog = catalog.filter((p: any) =>
              p.category?.toString() === this.selectedCategoryId?.toString()
            );
          }

          this.totalProducts = catalog.length;
          const start = pageIndex * this.pageSize;
          this.filteredProducts = catalog.slice(start, start + this.pageSize);
          this.currentPage = pageIndex;
          console.log('Productos cargados desde caché offline:', this.filteredProducts.length);
          this.isLoading = false;
          return;
        } catch (e) {
          console.error('Error leyendo caché offline:', e);
        }
      }
      this.filteredProducts = [];
      this.totalProducts = 0;
      this.isLoading = false;
      return;
    }

    this.productService.getProducts(
      this.searchQuery || undefined,
      this.selectedCategoryId,
      backendPage,
      this.pageSize
    ).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.filteredProducts = response.results || [];
        this.totalProducts = response.count || 0;
        this.currentPage = pageIndex;
        console.log('Productos cargados:', this.filteredProducts.length);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando productos:', error);
        // Fallback a caché offline con paginación correcta
        const cached = localStorage.getItem('storehub_offline_catalog');
        if (cached) {
          try {
            const catalog = JSON.parse(cached);
            const start = pageIndex * this.pageSize;
            this.filteredProducts = catalog.slice(start, start + this.pageSize);
            this.totalProducts = catalog.length;
            this.currentPage = pageIndex;
          } catch(e) {
            this.filteredProducts = [];
            this.totalProducts = 0;
          }
        } else {
          this.filteredProducts = [];
          this.totalProducts = 0;
          this.showError('Error al cargar los productos');
        }
        this.isLoading = false;
      }

    });
  }

  loadClients(): void {
    console.log('Iniciando carga de clientes...');
    this.clientService.getClients(1, 1000).subscribe({
      next: (data) => {
        console.log('Respuesta clientes:', data);
        this.clients = data.results || [];
        console.log('Clientes cargados:', this.clients.length);
        const defaultClient = this.clients.find(c => c.name.includes('Mostrador'));
        if (defaultClient) {
          this.selectedClientId = defaultClient.id;
          console.log('Cliente por defecto seleccionado:', defaultClient.name);
        }
      },
      error: (error) => {
        console.error('Error cargando clientes:', error);
        this.clients = [];
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Error cargando categorías:', error);
        this.categories = [];
      }
    });
  }

  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  onCategoryChange(): void {
    this.currentPage = 0;
    this.loadAllProducts(0);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategoryId = undefined;
    this.currentPage = 0;
    this.loadAllProducts(0);
  }

  onPageChange(event: PageEvent): void {
    this.loadAllProducts(event.pageIndex);
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
    this.updateSuggestion();
    this.showSuccess(`${product.name} agregado al ticket`);
    console.log (this.ticketItems);
  }

  onAddProduct(): void {
    if (this.searchForm.invalid) return;

    const sku = this.searchForm.value.sku;
    const productFound = this.filteredProducts.find(p => p.sku === sku);

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
      this.updateSuggestion();
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
    this.subtotalVenta = this.totalVenta / 1.16;
    this.ivaVenta = this.totalVenta - this.subtotalVenta;
  }

  removeItem(index: number): void {
    this.ticketItems.splice(index, 1);
    this.calculateTotal();
    this.updateSuggestion();
  }

  updateSuggestion(): void {
    this.currentSuggestion = null;
    if (!this.isPremium || this.ticketItems.length === 0 || this.marketBasketRules.length === 0) return;
    
    // Look at the last item added
    const lastItem = this.ticketItems[this.ticketItems.length - 1];
    
    // Find rules where product_a is the last item
    const matchingRules = this.marketBasketRules.filter(r => r.product_a === lastItem.nombre);
    
    for (const rule of matchingRules) {
      // Make sure product_b is NOT already in the ticket
      const alreadyInTicket = this.ticketItems.some(item => item.nombre === rule.product_b);
      if (!alreadyInTicket) {
        this.currentSuggestion = {
          productName: rule.product_b,
          confidence: rule.confidence_a_to_b
        };
        
        // Buscar el precio del producto sugerido
        this.productService.getProducts(rule.product_b, undefined, 1, 1).subscribe({
          next: (res) => {
            const found = res.results.find((p: Product) => p.name === rule.product_b);
            if (found && this.currentSuggestion && this.currentSuggestion.productName === rule.product_b) {
              this.currentSuggestion.price = found.price;
            }
          }
        });
        
        break;
      }
    }
  }

  addSuggestedProduct(): void {
    if (!this.currentSuggestion) return;
    
    const nameToSearch = this.currentSuggestion.productName;
    this.productService.getProducts(nameToSearch, undefined, 1, 1).subscribe({
      next: (res) => {
        const found = res.results.find((p: Product) => p.name === nameToSearch);
        if (found) {
          this.addProductToTicket(found);
        } else {
          this.showError('No se pudo encontrar el producto sugerido.');
        }
      }
    });
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

    if (!this.isCashRegisterOpen) {
      const dialogRef = this.dialog.open(CashRegisterDialogComponent, {
        width: '450px',
        disableClose: true,
        data: { action: 'open' }
      });
      
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.isCashRegisterOpen = true;
          this.showSuccess('Caja abierta exitosamente. Procediendo con el cobro...');
          this.onConfirmSale();
        }
      });
      return;
    }

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
    const saleDetails = this.ticketItems.map(item => ({
      product: item.id,
      quantity: item.cantidad
    }));

    const saleData = {
      client: this.selectedClientId || '',
      details: saleDetails
    };

    if (this.isOnline) {
      this.salesService.createSale(saleData).subscribe(saleResponse => {
        const selectedClientEmail = this.clients.find(c => c.id === this.selectedClientId)?.email;
        
        const dialogRef = this.dialog.open(SaleSuccessModalComponent, {
          width: '450px',
          disableClose: true,
          data: {
            saleId: saleResponse.id,
            clientEmail: selectedClientEmail,
            sale: saleResponse
          }
        });

        dialogRef.afterClosed().subscribe(() => {
          const productsWithLowStock: any[] = [];
          for (const item of this.ticketItems) {
            if (item.stock_disponible - item.cantidad <= this.LOW_STOCK_THRESHOLD) {
              productsWithLowStock.push(item);
            }
          }
          this.finishSale(productsWithLowStock);
        });
      });
    } else {
      this.offlineSyncService.queueSale(saleData);
      this.snackBar.open(
        'Venta guardada localmente. Se sincronizará al recuperar conexión.',
        'Cerrar',
        { duration: 3000, panelClass: ['snackbar-success'] }
      );
      this.finishSale([]);
    }
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
    this.updateSuggestion();
    this.loadAllProducts(this.currentPage);

    if (lowStockProducts.length > 0) {
      this.dialog.open(LowStockWarningModalComponent, {
        width: '450px',
        data: { products: lowStockProducts }
      });
    }
  }

  toggleCamera() {
    this.cameraEnabled = !this.cameraEnabled;
    if (this.cameraEnabled) {
      this.isCheckingCamera = true;
    }
  }

  openHardwareSettings() {
    this.dialog.open(HardwareSettingsModalComponent, {
      width: '500px'
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Ignore keystrokes if the user is typing in an input or textarea
    const target = event.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      return;
    }

    const now = Date.now();
    // If the last key was pressed more than 50ms ago, reset the buffer
    // Physical scanners type very fast (usually ~10-20ms per character)
    if (now - this.lastScanTime > 50) {
      this.barcodeBuffer = '';
    }
    
    this.lastScanTime = now;

    if (event.key === 'Enter') {
      if (this.barcodeBuffer.length > 2) { // Minimal length for a barcode
        event.preventDefault(); // Evitar que el Enter dispare clics en botones con foco (ej. el menú)
        this.scanSuccess(this.barcodeBuffer);
        this.barcodeBuffer = '';
      }
      return;
    }

    // Ignore special keys like Shift, Control, etc.
    if (event.key.length === 1) {
      this.barcodeBuffer += event.key;
    }
  }

  camerasFound(devices: MediaDeviceInfo[]) {
    this.isCheckingCamera = false;
    this.hasDevices = devices && devices.length > 0;
    this.availableDevices = devices;
    
    // Explicitly select a camera, preferring the back camera if available
    if (this.hasDevices && !this.currentDevice) {
      const backCamera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('trasera'));
      this.currentDevice = backCamera || devices[0];
    }
  }

  camerasNotFound() {
    this.isCheckingCamera = false;
    this.hasDevices = false;
    this.availableDevices = [];
    this.currentDevice = undefined;
    this.snackBar.open('No se encontraron cámaras o no se dio permiso.', 'Cerrar', { duration: 3000, panelClass: ['snackbar-error'] });
  }

  scanSuccess(resultString: string) {
    if (!resultString) return;

    const now = Date.now();
    if (resultString === this.lastScannedCode && (now - this.lastSuccessScanTime) < 500) {
      // Ignorar el mismo código si se escanea dentro de 500ms para evitar rebotes,
      // pero permitir escanear rápido múltiples artículos iguales.
      return;
    }
    
    this.lastScannedCode = resultString;
    this.lastSuccessScanTime = now;
    // Don't update lastScanTime here because it interferes with the physical scanner's 50ms buffer tracking
    
    this.playScanSound();

    // Buscar y agregar al carrito
    this.productService.getProducts(resultString, undefined, 1, 1).subscribe({
      next: (response) => {
        const found = response.results.find((p: Product) => p.sku === resultString);
        if (found) {
          this.addProductToTicket(found);
          this.snackBar.open(`¡${found.name} agregado!`, 'Cerrar', { duration: 1500, panelClass: ['snackbar-success'] });
        } else {
          this.snackBar.open(`Producto con SKU ${resultString} no encontrado.`, 'Cerrar', { duration: 2500, panelClass: ['snackbar-warning'] });
        }
      }
    });
  }

  playScanSound() {
    try {
      // Un sonido sintético simple (beep) con Web Audio API
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, context.currentTime); // 800 Hz
      
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.1);
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.1);
    } catch(e) {
      console.warn('Audio no soportado o silenciado por el navegador');
    }
  }
}
