import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
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
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss'
})
export class CategoryFormComponent implements OnInit {

  pageTitle: string = 'Crear Nueva Categoría';
  isEditMode = false;
  isLoading = false;
  private currentCategoryId: string | null = null;

  categoryForm!: FormGroup;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private categoryService = inject(CategoryService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.categoryForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl(''),
    });

    this.route.paramMap.subscribe(params => {
      this.currentCategoryId = params.get('id');
      if (this.currentCategoryId) {
        this.isEditMode = true;
        this.pageTitle = 'Editar Categoría';
        this.isLoading = true;

        this.categoryService.getCategoryById(this.currentCategoryId).subscribe({
          next: (category) => {
            if (category) {
              this.categoryForm.patchValue(category);
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error cargando categoría:', error);
            this.snackBar.open('Error al cargar los datos de la categoría', 'Cerrar', { duration: 3000 });
            this.isLoading = false;
            this.router.navigate(['/dashboard/categories']);
          }
        });
      }
    });
  }
  onSubmit(): void {
    if (this.categoryForm.valid) {
      const categoryData = this.categoryForm.value;

      if (this.isEditMode && this.currentCategoryId) {
        this.categoryService.updateCategory(this.currentCategoryId, categoryData)
          .subscribe({
            next: () => {
              this.snackBar.open('Categoría actualizada exitosamente', 'Cerrar', { duration: 3000 });
              this.router.navigate(['/dashboard/categories']);
            },
            error: (error) => {
              console.error('Error actualizando categoría:', error);
              this.snackBar.open('Error al actualizar la categoría', 'Cerrar', { duration: 3000 });
            }
          });

      } else {
        this.categoryService.createCategory(categoryData)
          .subscribe({
            next: () => {
              this.snackBar.open('Categoría creada exitosamente', 'Cerrar', { duration: 3000 });
              this.router.navigate(['/dashboard/categories']);
            },
            error: (error) => {
              console.error('Error creando categoría:', error);
              this.snackBar.open('Error al crear la categoría', 'Cerrar', { duration: 3000 });
            }
          });
      }
    }
  }
}
