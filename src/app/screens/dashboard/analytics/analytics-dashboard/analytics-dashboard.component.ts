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
import { ReportService } from '../../../../services/report.service';

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
  private reportService = inject(ReportService);
  public authService = inject(AuthService);

  kpiData: DashboardKPI | null = null;
  fintechKpis: {
    atv: number;
    upt: number;
    loyaltyRate: number;
    inventoryValue: number;
  } | null = null;
  topSellers: TopSeller[] = [];
  displayedColumnsSellers: string[] = ['seller', 'ventas', 'monto'];
  isLoading = true;

  // Chart configuration defaults for light theme
  private defaultChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    color: '#64748b',
    plugins: {
      legend: {
        labels: { color: '#334155' }
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
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: '#64748b' }
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: '#64748b' }
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
    color: '#64748b',
    plugins: {
      legend: { position: 'right', labels: { color: '#334155' } },
      tooltip: this.defaultChartOptions.plugins?.tooltip
    }
  };

  // 4. Sales by Hour (Bar)
  salesByHourChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  salesByHourChartOptions: ChartOptions<any> = { ...this.defaultChartOptions };

  // Premium BI Data
  marketBasketRules: any[] = [];
  safetyStockAlerts: any[] = [];
  abcItems: any[] = [];
  
  abcChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  abcChartOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    color: '#64748b',
    plugins: {
      legend: { position: 'right', labels: { color: '#334155' } },
      tooltip: this.defaultChartOptions.plugins?.tooltip
    }
  };

  isPremium = false;

  ngOnInit() {
    this.isPremium = this.authService.isPremium();
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    forkJoin({
      kpi: this.analyticsService.getDashboardKPI(),
      salesReport: this.reportService.getSalesReport(),
      inventoryValue: this.reportService.getInventoryValue(),
      salesOverTime: this.analyticsService.getSalesOverTime('day', 30),
      topProducts: this.analyticsService.getTopProducts(10),
      salesByCategory: this.analyticsService.getSalesByCategory(),
      salesByHour: this.analyticsService.getSalesByHour(),
      topSellers: this.analyticsService.getTopSellers(),
      marketBasket: this.isPremium ? this.analyticsService.getMarketBasket() : of(null),
      safetyStock: this.isPremium ? this.analyticsService.getSafetyStock() : of(null),
      abcAnalysis: this.isPremium ? this.analyticsService.getAbcAnalysis() : of(null)
    }).subscribe({
      next: (data: any) => {
        this.kpiData = data.kpi;
        this.fintechKpis = {
          atv: data.salesReport.atv || 0,
          upt: data.salesReport.upt || 0,
          loyaltyRate: data.salesReport.loyalty_rate || 0,
          inventoryValue: data.inventoryValue.capital_inmovilizado || 0
        };
        this.setupSalesLineChart(data.salesOverTime);
        this.setupTopProductsChart(data.topProducts);
        this.setupCategoryChart(data.salesByCategory);
        this.setupSalesByHourChart(data.salesByHour);
        this.topSellers = data.topSellers;
        
        if (data.marketBasket) {
          this.marketBasketRules = data.marketBasket;
        }
        if (data.safetyStock) {
          this.safetyStockAlerts = data.safetyStock.filter((s: any) => s.status === 'CRITICAL');
        }
        if (data.abcAnalysis) {
          this.abcItems = data.abcAnalysis;
          this.setupAbcChart(data.abcAnalysis);
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

  abcProductsA: string[] = [];
  abcProductsB: string[] = [];
  abcProductsC: string[] = [];

  private setupAbcChart(data: any[]) {
    let revA = 0, revB = 0, revC = 0;
    this.abcProductsA = [];
    this.abcProductsB = [];
    this.abcProductsC = [];

    data.forEach(item => {
      if (item.category === 'A') {
        revA += item.revenue;
        this.abcProductsA.push(item.product_name);
      }
      else if (item.category === 'B') {
        revB += item.revenue;
        this.abcProductsB.push(item.product_name);
      }
      else {
        revC += item.revenue;
        this.abcProductsC.push(item.product_name);
      }
    });

    this.abcChartData = {
      labels: ['A (80% Ingresos)', 'B (15% Ingresos)', 'C (5% Ingresos)'],
      datasets: [
        {
          data: [revA, revB, revC],
          backgroundColor: ['#10b981', '#f59e0b', '#64748b'],
          borderWidth: 0,
          hoverOffset: 4
        }
      ]
    };
  }
}
