import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatTooltipModule
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
            this.loadCategories();
          }
        });
      }
    });
  }
}