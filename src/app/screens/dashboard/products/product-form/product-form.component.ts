import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

// Importaciones de Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../../services/product.service';
import { CategoryService } from '../../../../services/category.service';
import { Product } from '../../../../shared/interfaces/product';
import { Category } from '../../../../shared/interfaces/category';

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
    MatProgressSpinnerModule
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit {

  // Título de la página (cambiará si es 'editar')
  pageTitle: string = 'Crear Nuevo Producto';

  // Categorías y estados
  categories: Category[] = [];
  estadosSimulados = [
    { value: true, viewValue: 'Activo' },
    { value: false, viewValue: 'Inactivo' },
  ];

  // Nueva propiedad para guardar el ID actual
  private currentProductId: string | null = null;
  isEditMode = false;
  isLoading = false;

  // Inyecta los servicios
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  productForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();

    // Cargar categorías
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error cargando categorías:', error);
        this.snackBar.open('Error al cargar las categorías', 'Cerrar', { duration: 3000 });
      }
    });

    // Lee el ID de la URL
    this.route.paramMap.subscribe(params => {
      this.currentProductId = params.get('id');

      if (this.currentProductId) {
        // --- MODO EDICIÓN ---
        this.isEditMode = true;
        this.pageTitle = 'Editar Producto';
        this.isLoading = true;

        // Carga los datos del producto
        this.productService.getProductById(this.currentProductId).subscribe({
          next: (product) => {
            if (product) {
              // Rellena el formulario con los datos
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
        // --- MODO CREAR ---
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
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9-_]+$/)
      ]),
      price: new FormControl(0, [
        Validators.required,
        Validators.min(0.01),
        Validators.max(999999)
      ]),
      cost_price: new FormControl(0, [
        Validators.required,
        Validators.min(0),
        Validators.max(999999)
      ]),
      stock: new FormControl(0, [
        Validators.required,
        Validators.min(0),
        Validators.max(999999),
        Validators.pattern(/^\d+$/)
      ]),
      category: new FormControl('', [Validators.required]),
      is_active: new FormControl(true, [Validators.required]),
    });
  }

  // Métodos helper para obtener errores
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
    // Marcar todos los campos como touched para mostrar errores
    Object.keys(this.productForm.controls).forEach(key => {
      this.productForm.get(key)?.markAsTouched();
    });

    if (this.productForm.valid) {
      const productData = this.productForm.value;

      if (this.isEditMode && this.currentProductId) {
        // --- Lógica de ACTUALIZAR ---
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
        // --- Lógica de CREAR ---
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
