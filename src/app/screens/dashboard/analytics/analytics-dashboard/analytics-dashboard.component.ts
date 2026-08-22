import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartOptions, ChartData, ChartType } from 'chart.js';
import { forkJoin, of } from 'rxjs';
import { AnalyticsService, DashboardKPI, SalesOverTime, TopProduct, SalesByCategory, SalesByHour, TopSeller } from '../../../../services/analytics.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatTableModule,
    MatButtonModule,
    RouterModule,
    BaseChartDirective
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.scss']
})
export class AnalyticsDashboardComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  public authService = inject(AuthService);

  kpiData: DashboardKPI | null = null;
  topSellers: TopSeller[] = [];
  displayedColumnsSellers: string[] = ['seller', 'ventas', 'monto'];
  isLoading = true;

  // Chart configuration defaults for dark theme
  private defaultChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    color: '#94a3b8',
    plugins: {
      legend: {
        labels: { color: '#f1f5f9' }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#f1f5f9',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  // 1. Sales Over Time (Line)
  salesLineChartData: ChartData<'line'> = { labels: [], datasets: [] };
  salesLineChartOptions: ChartOptions<any> = {
    ...this.defaultChartOptions,
    elements: {
      line: { tension: 0.4 }
    }
  };

  // 2. Top Products (Horizontal Bar)
  topProductsChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  topProductsChartOptions: ChartOptions<any> = {
    ...this.defaultChartOptions,
    indexAxis: 'y',
  };

  // 3. Category (Doughnut)
  categoryChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  categoryChartOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    color: '#94a3b8',
    plugins: {
      legend: { position: 'right', labels: { color: '#f1f5f9' } },
      tooltip: this.defaultChartOptions.plugins?.tooltip
    }
  };

  // 4. Sales by Hour (Bar)
  salesByHourChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  salesByHourChartOptions: ChartOptions<any> = { ...this.defaultChartOptions };

  isPremium = false;

  ngOnInit() {
    this.isPremium = this.authService.isPremium();
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    forkJoin({
      kpi: this.analyticsService.getDashboardKPI(),
      salesOverTime: this.analyticsService.getSalesOverTime('day', 30),
      topProducts: this.analyticsService.getTopProducts(10),
      salesByCategory: this.analyticsService.getSalesByCategory(),
      salesByHour: this.analyticsService.getSalesByHour(),
      topSellers: this.analyticsService.getTopSellers(),
      profitability: this.isPremium ? this.analyticsService.getProfitability() : of(null),
      predictions: this.isPremium ? this.analyticsService.getPredictions(30) : of(null)
    }).subscribe({
      next: (data: any) => {
        this.kpiData = data.kpi;
        this.setupSalesLineChart(data.salesOverTime);
        this.setupTopProductsChart(data.topProducts);
        this.setupCategoryChart(data.salesByCategory);
        this.setupSalesByHourChart(data.salesByHour);
        this.topSellers = data.topSellers;
        if (data.profitability) {
          this.setupProfitabilityChart(data.profitability);
        }
        if (data.predictions) {
          this.setupPredictionsChart(data.predictions);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading analytics', err);
        this.isLoading = false;
      }
    });
  }

  private setupSalesLineChart(data: SalesOverTime[]) {
    this.salesLineChartData = {
      labels: data.map(d => d.date),
      datasets: [
        {
          data: data.map(d => d.total),
          label: 'Ingresos',
          borderColor: '#448aff',
          backgroundColor: 'rgba(68, 138, 255, 0.2)',
          fill: true,
          pointBackgroundColor: '#448aff'
        }
      ]
    };
  }

  private setupTopProductsChart(data: TopProduct[]) {
    this.topProductsChartData = {
      labels: data.map(d => d.product_name),
      datasets: [
        {
          data: data.map(d => d.total_vendido),
          label: 'Cantidad Vendida',
          backgroundColor: '#4ade80',
          borderRadius: 4
        }
      ]
    };
  }

  private setupCategoryChart(data: SalesByCategory[]) {
    this.categoryChartData = {
      labels: data.map(d => d.category),
      datasets: [
        {
          data: data.map(d => d.total),
          backgroundColor: ['#448aff', '#4ade80', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#ec4899'],
          borderWidth: 0,
          hoverOffset: 4
        }
      ]
    };
  }

  private setupSalesByHourChart(data: SalesByHour[]) {
    this.salesByHourChartData = {
      labels: data.map(d => `${d.hour}:00`),
      datasets: [
        {
          data: data.map(d => d.total),
          label: 'Ventas por Hora',
          backgroundColor: '#a855f7',
          borderRadius: 4
        }
      ]
    };
  }

  // Premium Charts
  profitabilityChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  profitabilityChartOptions: ChartOptions<any> = { ...this.defaultChartOptions, indexAxis: 'x' };
  
  predictionsChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  predictionsChartOptions: ChartOptions<any> = { ...this.defaultChartOptions };

  private setupProfitabilityChart(data: any[]) {
    this.profitabilityChartData = {
      labels: data.map(d => d.product_name).slice(0, 5),
      datasets: [
        {
          data: data.map(d => d.margin).slice(0, 5),
          label: 'Margen de Ganancia (%)',
          backgroundColor: '#f59e0b',
          borderRadius: 4
        }
      ]
    };
  }

  private setupPredictionsChart(data: any) {
    if (!data || !data.predictions) return;
    
    this.predictionsChartData = {
      labels: data.predictions.map((p: any) => {
        // Formato de fecha corto (ej. "Aug 25")
        const d = new Date(p.date + 'T00:00:00');
        return d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          data: data.predictions.map((p: any) => p.predicted_total),
          label: 'Ingresos Proyectados',
          backgroundColor: data.historical_trend === 'negative' ? '#ef4444' : '#448aff',
          borderRadius: 4
        }
      ]
    };
  }
}
