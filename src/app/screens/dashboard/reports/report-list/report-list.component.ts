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

// Servicio
import { ReportService } from '../../../../services/report.service';

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
    MatIconModule
  ],
  templateUrl: './report-list.component.html',
  styleUrl: './report-list.component.scss'
})
export class ReportListComponent implements OnInit {

  private reportService = inject(ReportService);

  // Formulario para el rango de fechas
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  // Variables para guardar los datos
  reportData: any = null;

  ngOnInit(): void {
    this.loadReport(); // Carga el reporte inicial
  }

  // Llama al servicio para cargar los datos
  loadReport(): void {
    const { start, end } = this.range.value;
    this.reportService.getSalesReport(start ?? undefined, end ?? undefined)
      .subscribe(data => {
        this.reportData = data;
      });
  }

  // Se llama al hacer clic en "Filtrar"
  onFilter(): void {
    console.log('Filtrando por:', this.range.value);
    this.loadReport();
  }
}
