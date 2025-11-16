import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

// Importaciones de Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

// Servicios e Interfaces
import { ReportService } from '../../../../services/report.service';
import { CategoryService } from '../../../../services/category.service';
import { Category } from '../../../../shared/interfaces/category';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './report-list.component.html',
  styleUrl: './report-list.component.scss'
})
export class ReportListComponent implements OnInit {

  private reportService = inject(ReportService);
  private categoryService = inject(CategoryService);

  // Formulario para los filtros
  filterForm = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
    categoria: new FormControl<string | null>(null),
    vendedor: new FormControl<string | null>(null),
  });

  // Variables para guardar los datos
  reportData: any = null;

  // Arrays para los dropdowns
  categories: Category[] = [];
  vendedoresSimulados = [
    { id: 'admin@storehub.com', nombre: 'Administrador' },
    { id: 'cajero@storehub.com', nombre: 'Cajero' }
  ];

  ngOnInit(): void {
    this.loadReport(); // Carga el reporte inicial
    this.loadCategories(); // Carga las categorías
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }

  // Llama al servicio para cargar los datos
  loadReport(): void {
    const { start, end, categoria, vendedor } = this.filterForm.value;

    this.reportService.getSalesReport(start ?? undefined, end ?? undefined)
      .subscribe(data => {
        this.reportData = data;
      });
  }

  // Se llama al hacer clic en "Filtrar"
  onFilter(): void {
    console.log('Filtrando por:', this.filterForm.value);
    this.loadReport();
  }
}
