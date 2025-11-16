import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Importaciones de Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog } from '@angular/material/dialog';

// Importaciones del servicio y diálogo
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
    MatToolbarModule
  ],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss'
})
export class CategoryListComponent implements OnInit {

  displayedColumns: string[] = ['nombre', 'descripcion', 'acciones'];
  dataSource: Category[] = [];

  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe(data => {
      this.dataSource = [...data];
    });
  }

  // Método para abrir el diálogo de borrado
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
        this.categoryService.deleteCategory(categoryId).subscribe(success => {
          if (success) {
            console.log('Categoría eliminada');
            this.loadCategories();
          } else {
            console.error('Error al eliminar la categoría');
          }
        });
      }
    });
  }
}
