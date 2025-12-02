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

import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../../services/product.service';
import { Product } from '../../../../shared/interfaces/product';

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
    MatIconModule
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit {

  // Título de la página (cambiará si es 'editar')
  pageTitle: string = 'Crear Nuevo Producto';

  // Datos simulados para los <select>
  // En el futuro, las categorías vendrán de un servicio
  categoriasSimuladas = ['Electrónica', 'Accesorios', 'Ropa', 'Hogar'];
  estadosSimulados = [
    { value: 'activo', viewValue: 'Activo' },
    { value: 'inactivo', viewValue: 'Inactivo' },
  ];

  // Nueva propiedad para guardar el ID actual
  private currentProductId: string | null = null;
  isEditMode = false;

  // Inyecta los servicios
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private router = inject(Router);

  productForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();

    // Lee el ID de la URL
    this.route.paramMap.subscribe(params => {
      this.currentProductId = params.get('id');

      if (this.currentProductId) {
        // --- MODO EDICIÓN ---
        this.isEditMode = true;
        this.pageTitle = 'Editar Producto';

        // Carga los datos del producto
        this.productService.getProductById(this.currentProductId).subscribe(product => {
          if (product) {
            // Rellena el formulario con los datos
            this.productForm.patchValue(product);
          } else {
            // (Opcional) Manejar caso de producto no encontrado
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
      nombre: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]),
      descripcion: new FormControl('', [
        Validators.maxLength(500)
      ]),
      codigo_barras: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9-_]+$/)
      ]),
      precio_venta: new FormControl(0, [
        Validators.required,
        Validators.min(0.01),
        Validators.max(999999)
      ]),
      costo_adquisicion: new FormControl(0, [
        Validators.required,
        Validators.min(0),
        Validators.max(999999)
      ]),
      cantidad_stock: new FormControl(0, [
        Validators.required,
        Validators.min(0),
        Validators.max(999999),
        Validators.pattern(/^\d+$/)
      ]),
      categoria: new FormControl('', [Validators.required]),
      estado: new FormControl('activo', [Validators.required]),
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
        // --- Lógica de ACTUALIZAR (Simulada) ---
        console.log('Modo Edición. Datos:', productData);
        // En el futuro: this.productService.updateProduct(this.currentProductId, productData)...
        this.router.navigate(['/dashboard/products']); // Redirige a la lista
      } else {
        // --- Lógica de CREAR (Simulada) ---
        console.log('Modo Creación. Datos:', productData);
        // En el futuro: this.productService.createProduct(productData)...
        this.router.navigate(['/dashboard/products']); // Redirige a la lista
      }

    } else {
      console.log('Formulario inválido. Por favor, corrige los errores.');
    }
  }
}
