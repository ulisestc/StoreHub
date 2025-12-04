import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatTooltipModule
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {

  displayedColumns: string[] = ['name', 'sku', 'price', 'stock', 'estado', 'acciones'];
  dataSource: Product[] = [];

  private productService = inject(ProductService);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe(data => {
      this.dataSource = [...data];
    });
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
        this.deleteProduct(productId);
      }
    });
  }

  private deleteProduct(id: string): void {
    this.productService.deleteProduct(id).subscribe(success => {
      if (success) {
        this.loadProducts();
      }
    });
  }
}
