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
    this.categoryForm = new FormGroup({
      nombre: new FormControl('', [Validators.required]),
      descripcion: new FormControl(''),
    });

    this.route.paramMap.subscribe(params => {
      this.currentCategoryId = params.get('id');
      if (this.currentCategoryId) {
        this.isEditMode = true;
        this.pageTitle = 'Editar Categoría';

        this.categoryService.getCategoryById(this.currentCategoryId).subscribe(category => {
          if (category) {
            this.categoryForm.patchValue(category);
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
          .subscribe(() => this.router.navigate(['/dashboard/categories']));

      } else {
        this.categoryService.createCategory(categoryData)
          .subscribe(() => this.router.navigate(['/dashboard/categories']));
      }
    }
  }
}