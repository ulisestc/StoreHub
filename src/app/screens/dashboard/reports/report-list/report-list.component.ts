import { Component, OnInit, inject, ViewChild } from '@angular/core';
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
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
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
    MatSelectModule,
    BaseChartDirective
  ],
  templateUrl: './report-list.component.html',
  styleUrl: './report-list.component.scss'
})
export class ReportListComponent implements OnInit {

  private reportService = inject(ReportService);
  private categoryService = inject(CategoryService);

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

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

  // Configuración para gráfica de línea (Ingresos mensuales)
  public lineChartData: ChartData<'line'> = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0],
        label: 'Ingresos',
        fill: true,
        tension: 0.4,
        borderColor: '#448aff',
        backgroundColor: 'rgba(68, 138, 255, 0.1)',
        pointBackgroundColor: '#448aff',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#448aff'
      }
    ]
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#f1f5f9',
          font: { size: 12, family: 'Poppins' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#f1f5f9',
        borderColor: '#448aff',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      },
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      }
    }
  };

  public lineChartType: ChartType = 'line';

  // Configuración para gráfica de dona (Ventas por categoría)
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#448aff',
          '#4ade80',
          '#fbbf24',
          '#f87171',
          '#a78bfa',
          '#fb923c'
        ],
        hoverBackgroundColor: [
          '#5e9fff',
          '#6ee89d',
          '#fccf4d',
          '#fa8c8c',
          '#b99ffb',
          '#fca55f'
        ],
        borderColor: '#1e293b',
        borderWidth: 2
      }
    ]
  };

  public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          color: '#f1f5f9',
          font: { size: 11, family: 'Poppins' },
          padding: 10
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#f1f5f9',
        borderColor: '#448aff',
        borderWidth: 1
      }
    }
  };

  public doughnutChartType: ChartType = 'doughnut';

  // Configuración para gráfica de barras (Top productos)
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Unidades vendidas',
        backgroundColor: '#448aff',
        hoverBackgroundColor: '#5e9fff',
        borderColor: '#448aff',
        borderWidth: 0,
        borderRadius: 8
      }
    ]
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#f1f5f9',
          font: { size: 12, family: 'Poppins' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#f1f5f9',
        borderColor: '#448aff',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#94a3b8', stepSize: 1 },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      },
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      }
    }
  };

  public barChartType: ChartType = 'bar';

  ngOnInit(): void {
    this.loadReport();
    this.loadCategories();
  }

  loadCategories(): void {
    console.log('🔍 Cargando categorías para reportes...');
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        console.log('✅ Categorías recibidas:', data);
        this.categories = Array.isArray(data) ? data : [];
        console.log('🎯 Total categorías:', this.categories.length);
      },
      error: (error) => {
        console.error('❌ Error cargando categorías:', error);
        this.categories = [];
      }
    });
  }

  loadReport(): void {
    const { start, end } = this.filterForm.value;
    console.log('🔍 Cargando reporte de ventas...', { start, end });
    this.reportService.getSalesReport(start ?? undefined, end ?? undefined)
      .subscribe({
        next: (data) => {
          console.log('✅ Datos del reporte recibidos:', data);
          this.reportData = data;
          this.updateCharts();
        },
        error: (error) => {
          console.error('❌ Error cargando reporte:', error);
          this.reportData = {
            totalIngresos: 0,
            totalTransacciones: 0,
            topProducts: []
          };
        }
      });
  }

  updateCharts(): void {
    if (!this.reportData) return;

    // Actualizar gráfica de línea (ingresos mensuales simulados)
    const monthlyData = this.generateMonthlyData();
    this.lineChartData.labels = monthlyData.labels;
    this.lineChartData.datasets[0].data = monthlyData.data;

    // Actualizar gráfica de dona (ventas por categoría)
    if (this.reportData.topProducts && this.reportData.topProducts.length > 0) {
      const categoryMap = new Map<string, number>();
      this.reportData.topProducts.forEach((product: any) => {
        const category = product.category || 'Sin categoría';
        categoryMap.set(category, (categoryMap.get(category) || 0) + product.sold);
      });

      this.doughnutChartData.labels = Array.from(categoryMap.keys());
      this.doughnutChartData.datasets[0].data = Array.from(categoryMap.values());
    }

    // Actualizar gráfica de barras (top productos)
    if (this.reportData.topProducts && this.reportData.topProducts.length > 0) {
      const top5 = this.reportData.topProducts.slice(0, 5);
      this.barChartData.labels = top5.map((p: any) => p.name);
      this.barChartData.datasets[0].data = top5.map((p: any) => p.sold);
    }

    // Forzar actualización de las gráficas
    this.chart?.update();
  }

  generateMonthlyData(): { labels: string[], data: number[] } {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const baseIncome = this.reportData?.totalIngresos || 10000;
    const data = months.map(() => Math.random() * baseIncome * 0.3 + baseIncome * 0.1);
    return { labels: months, data };
  }

  onFilter(): void {
    this.loadReport();
  }
}
