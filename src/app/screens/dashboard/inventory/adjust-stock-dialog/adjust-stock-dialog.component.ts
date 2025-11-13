import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

// Importaciones de Material
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

// Servicios y Modelos
import { ProductService } from '../../../../services/product.service';
import { Product } from '../../../../shared/interfaces/product';

@Component({
  selector: 'app-adjust-stock-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './adjust-stock-dialog.component.html',
  styleUrl: './adjust-stock-dialog.component.scss'
})
export class AdjustStockDialogComponent implements OnInit {

  adjustForm!: FormGroup;
  products: Product[] = []; // Para el <select> de productos

  // Tipos de movimiento según el documento
  tiposMovimiento = ['entrada', 'salida', 'merma'];

  private productService = inject(ProductService);

  constructor(
    public dialogRef: MatDialogRef<AdjustStockDialogComponent>
  ) { }

  ngOnInit(): void {
    this.loadProducts();

    this.adjustForm = new FormGroup({
      producto: new FormControl('', [Validators.required]),
      tipo_movimiento: new FormControl('', [Validators.required]),
      cantidad: new FormControl(null, [Validators.required, Validators.min(1)]),
    });
  }

  // Carga los productos para el <select>
  loadProducts(): void {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
    });
  }

  onCancel(): void {
    this.dialogRef.close(); // Cierra sin devolver nada
  }

  onSave(): void {
    if (this.adjustForm.valid) {
      // Cierra y devuelve los datos del formulario
      this.dialogRef.close(this.adjustForm.value);
    }
  }
}
