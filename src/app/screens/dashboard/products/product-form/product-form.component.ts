import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

// Importaciones de Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatToolbarModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit {

  // Título de la página (cambiará si es 'editar')
  pageTitle: string = 'Crear Nuevo Producto';

  // Datos simulados para los <select>
  // En el futuro, las categorías vendrán de un servicio
  categoriasSimuladas = ['Electrónica', 'Accesorios', 'Ropa', 'Hogar'];
  estadosSimulados = [
    { value: 'activo', viewValue: 'Activo' },
    { value: 'inactivo', viewValue: 'Inactivo' },
  ];

  productForm!: FormGroup;

  ngOnInit(): void {
    this.productForm = new FormGroup({
      nombre: new FormControl('', [Validators.required]),
      descripcion: new FormControl(''),
      codigo_barras: new FormControl('', [Validators.required]),
      precio_venta: new FormControl(0, [Validators.required, Validators.min(0)]),
      costo_adquisicion: new FormControl(0, [Validators.required, Validators.min(0)]),
      cantidad_stock: new FormControl(0, [Validators.required, Validators.min(0)]),
      categoria: new FormControl('', [Validators.required]),
      estado: new FormControl('activo', [Validators.required]),
    });
  }

  // Método que se llamará al guardar
  onSubmit(): void {
    if (this.productForm.valid) {
      console.log('Formulario válido, datos:', this.productForm.value);
      // Aquí llamaremos al product.service.createProduct(this.productForm.value)
    } else {
      console.log('Formulario inválido');
    }
  }
}
