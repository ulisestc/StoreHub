import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
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
    MatIconModule,
    NgxMatSelectSearchModule
  ],
  templateUrl: './adjust-stock-modal.component.html',
  styleUrl: './adjust-stock-modal.component.scss'
})
export class AdjustStockModalComponent implements OnInit {

  adjustForm!: FormGroup;
  searchControl = new FormControl('');
  products$: Observable<Product[]> = of([]);
  tiposMovimiento = [
    { value: 'in', label: 'Entrada' },
    { value: 'out', label: 'Salida' },
    { value: 'loss', label: 'Merma' }
  ];

  private productService = inject(ProductService);

  constructor(
    public dialogRef: MatDialogRef<AdjustStockModalComponent>
  ) { }

  ngOnInit(): void {
    this.adjustForm = new FormGroup({
      producto: new FormControl('', [Validators.required]),
      tipo_movimiento: new FormControl('', [Validators.required]),
      cantidad: new FormControl(null, [Validators.required, Validators.min(1)])
    });

    this.products$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query) {
          return this.productService.getProducts().pipe(
            switchMap(res => of(res.results || []))
          );
        }
        return this.productService.getProducts(query).pipe(
          switchMap(res => of(res.results || []))
        );
      })
    );

    // Initial load
    this.searchControl.setValue('');
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
