import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../services/product.service';
import { Product } from '../../shared/interfaces/product';

@Component({
  selector: 'app-adjust-stock-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './adjust-stock-modal.component.html',
  styleUrl: './adjust-stock-modal.component.scss'
})
export class AdjustStockModalComponent implements OnInit {

  adjustForm!: FormGroup;
  products: Product[] = [];
  tiposMovimiento = ['entrada', 'salida', 'merma'];

  private productService = inject(ProductService);

  constructor(
    public dialogRef: MatDialogRef<AdjustStockModalComponent>
  ) { }

  ngOnInit(): void {
    this.loadProducts();

    this.adjustForm = new FormGroup({
      producto: new FormControl('', [Validators.required]),
      tipo_movimiento: new FormControl('', [Validators.required]),
      cantidad: new FormControl(null, [Validators.required, Validators.min(1)]),
      motivo: new FormControl('', [Validators.required])
    });
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe(data => {
      this.products = data;
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.adjustForm.valid) {
      this.dialogRef.close(this.adjustForm.value);
    }
  }
}