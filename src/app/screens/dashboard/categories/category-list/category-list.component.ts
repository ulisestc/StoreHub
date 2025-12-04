import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CategoryService } from '../../../../services/category.service';
import { Category } from '../../../../shared/interfaces/category';
import { ConfirmDeleteModalComponent } from '../../../../modals/confirm-delete-modal/confirm-delete-modal.component';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss'
})
export class CategoryListComponent implements OnInit {

  displayedColumns: string[] = ['name', 'description', 'acciones'];
  dataSource: Category[] = [];
  isLoading = false;

  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.dataSource = [...data];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando categorías:', error);
        this.snackBar.open('Error al cargar las categorías', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  openDeleteDialog(categoryId: string): void {
    const dialogRef = this.dialog.open(ConfirmDeleteModalComponent, {
      width: '350px',
      data: {
        title: 'Confirmar Borrado',
        message: '¿Estás seguro de que deseas eliminar esta categoría?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.categoryService.deleteCategory(categoryId).subscribe({
          next: () => {
            this.snackBar.open('Categoría eliminada exitosamente', 'Cerrar', { duration: 3000 });
            this.loadCategories();
          },
          error: (error) => {
            console.error('Error eliminando categoría:', error);
            this.snackBar.open('Error al eliminar la categoría', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }
}
