import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

// Importaciones de Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

// Servicio
import { CategoryService } from '../../../../services/category.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss'
})
export class CategoryFormComponent implements OnInit {

  pageTitle: string = 'Crear Nueva Categoría';
  isEditMode = false;
  private currentCategoryId: string | null = null;

  categoryForm!: FormGroup;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private categoryService = inject(CategoryService);

  ngOnInit(): void {
    // Define el formulario con validaciones completas
    this.categoryForm = new FormGroup({
      nombre: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]),
      descripcion: new FormControl('', [
        Validators.maxLength(200)
      ]),
    });

    // Comprueba si es modo edición
    this.route.paramMap.subscribe(params => {
      this.currentCategoryId = params.get('id');
      if (this.currentCategoryId) {
        this.isEditMode = true;
        this.pageTitle = 'Editar Categoría';

        // Carga los datos de la categoría
        this.categoryService.getCategoryById(this.currentCategoryId).subscribe(category => {
          if (category) {
            this.categoryForm.patchValue(category);
          }
        });
      }
    });
  }

  // Métodos helper para validaciones
  getErrorMessage(fieldName: string): string {
    const control = this.categoryForm.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;

    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['pattern'] && fieldName === 'nombre') {
      return 'Solo se permiten letras y espacios';
    }

    return 'Campo inválido';
  }

  hasError(fieldName: string): boolean {
    const control = this.categoryForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  onSubmit(): void {
    // Marcar todos los campos como touched
    Object.keys(this.categoryForm.controls).forEach(key => {
      this.categoryForm.get(key)?.markAsTouched();
    });

    if (this.categoryForm.valid) {
      const categoryData = this.categoryForm.value;

      if (this.isEditMode && this.currentCategoryId) {
        // --- Lógica de ACTUALIZAR (Simulada) ---
        console.log('Modo Edición. Datos:', categoryData);
        this.categoryService.updateCategory(this.currentCategoryId, categoryData)
          .subscribe(() => this.router.navigate(['/dashboard/categories']));

      } else {
        // --- Lógica de CREAR (Simulada) ---
        console.log('Modo Creación. Datos:', categoryData);
        this.categoryService.createCategory(categoryData)
          .subscribe(() => this.router.navigate(['/dashboard/categories']));
      }
    } else {
      console.log('Formulario inválido. Por favor, corrige los errores.');
    }
  }
}
