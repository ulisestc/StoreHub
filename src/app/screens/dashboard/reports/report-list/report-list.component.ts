import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
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

  filterForm = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
    categoria: new FormControl<string | null>(null),
    vendedor: new FormControl<string | null>(null),
  });

  reportData: any = null;
  categories: Category[] = [];
  vendedoresSimulados = [
    { id: 'admin@storehub.com', nombre: 'Administrador' },
    { id: 'cajero@storehub.com', nombre: 'Cajero' }
  ];

  ngOnInit(): void {
    this.loadReport();
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }

  loadReport(): void {
    const { start, end } = this.filterForm.value;
    this.reportService.getSalesReport(start ?? undefined, end ?? undefined)
      .subscribe(data => {
        this.reportData = data;
      });
  }

  onFilter(): void {
    this.loadReport();
  }
}