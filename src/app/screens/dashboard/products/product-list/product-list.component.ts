import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../../../services/product.service';
import { Product } from '../../../../shared/interfaces/product';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteModalComponent } from '../../../../modals/confirm-delete-modal/confirm-delete-modal.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatPaginatorModule
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {

  displayedColumns: string[] = ['name', 'sku', 'price', 'stock', 'estado', 'acciones'];
  dataSource: Product[] = [];
  isLoading = false;

  // Paginación
  totalProducts = 0;
  pageSize = 10;
  currentPage = 0;

  private productService = inject(ProductService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(pageIndex: number = 0): void {
    this.isLoading = true;
    const backendPage = pageIndex + 1;

    this.productService.getProductsPaginated(backendPage, this.pageSize).subscribe({
      next: (response) => {
        this.dataSource = [...response.results];
        this.totalProducts = response.count;
        this.currentPage = pageIndex;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando productos:', error);
        this.snackBar.open('Error al cargar los productos', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.loadProducts(event.pageIndex);
  }

  openDeleteDialog(productId: string): void {
    const dialogRef = this.dialog.open(ConfirmDeleteModalComponent, {
      width: '350px',
      data: {
        title: 'Confirmar Borrado',
        message: '¿Estás seguro de que deseas eliminar este producto?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.productService.deleteProduct(productId).subscribe({
          next: () => {
            this.snackBar.open('Producto eliminado exitosamente', 'Cerrar', { duration: 3000 });
            this.loadProducts(0);
          },
          error: (error) => {
            console.error('Error eliminando producto:', error);
            this.snackBar.open('Error al eliminar el producto', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }
}
