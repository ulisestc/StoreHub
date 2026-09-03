import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../../services/product.service';
import { CategoryService } from '../../../../services/category.service';
import { Product } from '../../../../shared/interfaces/product';
import { Category } from '../../../../shared/interfaces/category';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatToolbarModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ZXingScannerModule,
    MatTooltipModule
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit {

  pageTitle: string = 'Crear Nuevo Producto';

  // Categorías y estados
  categories: Category[] = [];
  estadosSimulados = [
    { value: true, viewValue: 'Activo' },
    { value: false, viewValue: 'Inactivo' },
  ];

  private currentProductId: string | null = null;
  isEditMode = false;
  isLoading = false;

  subtotalPreview: number = 0;
  ivaPreview: number = 0;

  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  productForm!: FormGroup;

  showScanner = false;
  allowedFormats = [ BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13, BarcodeFormat.CODE_128, BarcodeFormat.UPC_A ];

  isCheckingCamera = false;
  hasDevices = false;
  availableDevices: MediaDeviceInfo[] = [];
  currentDevice: MediaDeviceInfo | undefined = undefined;

  private barcodeBuffer = '';
  private lastScanTime = 0;
  lastScannedCode = '';

  toggleScanner() {
    this.showScanner = !this.showScanner;
    if (this.showScanner) {
      this.isCheckingCamera = true;
    }
  }

  camerasFound(devices: MediaDeviceInfo[]) {
    this.isCheckingCamera = false;
    this.hasDevices = devices && devices.length > 0;
    this.availableDevices = devices;
    
    if (this.hasDevices && !this.currentDevice) {
      const preferredCamera = devices.find(d => 
        d.label.toLowerCase().includes('droidcam') || 
        d.label.toLowerCase().includes('v4l2') || 
        d.label.toLowerCase().includes('back') || 
        d.label.toLowerCase().includes('trasera')
      );
      this.currentDevice = preferredCamera || devices[0];
    }
  }

  camerasNotFound() {
    this.isCheckingCamera = false;
    this.hasDevices = false;
    this.availableDevices = [];
    this.currentDevice = undefined;
    this.snackBar.open('No se encontraron cámaras o no se dio permiso.', 'Cerrar', { duration: 3000, panelClass: ['snackbar-error'] });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      return;
    }

    const now = Date.now();
    if (now - this.lastScanTime > 50) {
      this.barcodeBuffer = '';
    }
    
    this.lastScanTime = now;

    if (event.key === 'Enter') {
      if (this.barcodeBuffer.length > 2) { 
        this.scanSuccess(this.barcodeBuffer);
        this.barcodeBuffer = '';
      }
      return;
    }

    if (event.key.length === 1) {
      this.barcodeBuffer += event.key;
    }
  }

  scanSuccess(resultString: string) {
    if (resultString) {
      this.productForm.patchValue({ sku: resultString });
      this.showScanner = false;
      this.snackBar.open('Código escaneado correctamente', 'Cerrar', { duration: 2000, panelClass: ['snackbar-success'] });
      this.playScanSound();
    }
  }

  playScanSound() {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, context.currentTime);
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.1);
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.1);
    } catch(e) {}
  }

  ngOnInit(): void {
    this.initForm();

    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error cargando categorías:', error);
        this.snackBar.open('Error al cargar las categorías', 'Cerrar', { duration: 3000 });
      }
    });

    this.route.paramMap.subscribe(params => {
      this.currentProductId = params.get('id');

      if (this.currentProductId) {
        this.isEditMode = true;
        this.pageTitle = 'Editar Producto';
        this.isLoading = true;

        this.productService.getProductById(this.currentProductId).subscribe({
          next: (product) => {
            if (product) {
              this.productForm.patchValue({
                name: product.name,
                description: product.description || '',
                sku: product.sku,
                price: product.price,
                cost_price: product.cost_price,
                stock: product.stock,
                category: product.category,
                is_active: product.is_active
              });
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error cargando producto:', error);
            this.snackBar.open('Error al cargar los datos del producto', 'Cerrar', { duration: 3000 });
            this.isLoading = false;
            this.router.navigate(['/dashboard/products']);
          }
        });
      } else {
        this.isEditMode = false;
        this.pageTitle = 'Crear Nuevo Producto';
      }
    });
  }

  initForm(): void {
    this.productForm = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]),
      description: new FormControl('', [
        Validators.maxLength(500)
      ]),
      sku: new FormControl('', [
        Validators.maxLength(50)
      ]),
      price: new FormControl('', [
        Validators.required,
        Validators.min(0.01),
        Validators.max(999999)
      ]),
      cost_price: new FormControl('', [
        Validators.required,
        Validators.min(0),
        Validators.max(999999)
      ]),
      stock: new FormControl('', [
        Validators.required,
        Validators.min(0),
        Validators.max(999999),
        Validators.pattern(/^\d+$/)
      ]),
      category: new FormControl('', [Validators.required]),
      is_active: new FormControl(true, [Validators.required])
    });

    this.productForm.get('price')?.valueChanges.subscribe(val => {
      const price = parseFloat(val) || 0;
      this.subtotalPreview = price / 1.16;
      this.ivaPreview = price - this.subtotalPreview;
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.productForm.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;

    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['min']) return `El valor mínimo es ${errors['min'].min}`;
    if (errors['max']) return `El valor máximo es ${errors['max'].max}`;
    if (errors['pattern'] && fieldName === 'codigo_barras') {
      return 'Solo letras, números, guiones y guiones bajos';
    }
    if (errors['pattern'] && fieldName === 'cantidad_stock') {
      return 'Solo números enteros';
    }

    return 'Campo inválido';
  }

  hasError(fieldName: string): boolean {
    const control = this.productForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  onSubmit(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      this.productForm.get(key)?.markAsTouched();
    });

    if (this.productForm.valid) {
      const productData = this.productForm.value;

      if (this.isEditMode && this.currentProductId) {
        this.productService.updateProduct(this.currentProductId, productData).subscribe({
          next: () => {
            this.snackBar.open('Producto actualizado exitosamente', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/dashboard/products']);
          },
          error: (error) => {
            console.error('Error actualizando producto:', error);
            this.snackBar.open('Error al actualizar el producto', 'Cerrar', { duration: 3000 });
          }
        });
      } else {
        this.productService.createProduct(productData).subscribe({
          next: () => {
            this.snackBar.open('Producto creado exitosamente', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/dashboard/products']);
          },
          error: (error) => {
            console.error('Error creando producto:', error);
            this.snackBar.open('Error al crear el producto', 'Cerrar', { duration: 3000 });
          }
        });
      }
    } else {
      console.log('Formulario inválido. Por favor, corrige los errores.');
    }
  }
}
