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

  // ngOnInit se ejecuta cuando el componente carga
  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe(data => {
      this.dataSource = data;
    });
  }
}
