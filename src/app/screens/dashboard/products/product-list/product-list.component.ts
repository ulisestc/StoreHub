import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Importaciones de Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

// Importaciones del servicio y modelo
import { ProductService } from '../../../../services/product.service';
import { Product } from '../../../../shared/interfaces/product';

import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../modals/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {

  // Columnas que mostraremos en la tabla
  displayedColumns: string[] = ['nombre', 'codigo_barras', 'precio_venta', 'cantidad_stock', 'estado', 'acciones'];

  // Fuente de datos de la tabla
  dataSource: Product[] = [];

  // Inyectamos el servicio
  private productService = inject(ProductService);
  private dialog = inject(MatDialog);

  // ngOnInit se ejecuta cuando el componente carga
  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe(data => {
      this.dataSource = [...data];
    });
  }

  // Método para abrir el diálogo
  openDeleteDialog(productId: string): void {
    // Abre el componente ConfirmDialogComponent
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmar Borrado',
        message: '¿Estás seguro de que deseas eliminar este producto?'
      }
    });

    // Se suscribe a lo que el diálogo devuelve al cerrarse
    dialogRef.afterClosed().subscribe(result => {
      // Si el usuario hizo clic en "Eliminar" (result es 'true')
      if (result === true) {
        this.deleteProduct(productId);
      }
    });
  }

  // Método que llama al servicio para borrar
  private deleteProduct(id: string): void {
    this.productService.deleteProduct(id).subscribe(success => {
      if (success) {
        console.log('Producto eliminado');
        // Recargamos la lista para que la tabla se actualice
        this.loadProducts();
      } else {
        console.error('Error al eliminar el producto');
      }
    });
  }
}
