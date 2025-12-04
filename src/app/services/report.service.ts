import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError, map, forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';

const apiUrl = environment.apiUrl;

interface Sale {
  id: number;
  client: number;
  total: number;
  created_at: string;
  details: Array<{
    id: number;
    product: number;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private http: HttpClient) { }


  getReportHtml(endpoint: string, params: any = {}): Observable<string> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.append(key, params[key]);
      }
    });

    return this.http.get(`${apiUrl}/reports/${endpoint}/`, {
      params: httpParams,
      responseType: 'text'
    });
  }

  getSalesReport(startDate?: Date, endDate?: Date): Observable<any> {
    return forkJoin({
      sales: this.http.get<any>(`${apiUrl}/sales/`).pipe(
        map(response => response.results || response || []),
        catchError(() => of([]))
      ),
      products: this.http.get<any>(`${apiUrl}/products/`).pipe(
        map(response => response.results || response || []),
        catchError(() => of([]))
      ),
      categories: this.http.get<any>(`${apiUrl}/categories/`).pipe(
        map(response => response.results || response || []),
        catchError(() => of([]))
      )
    }).pipe(
      map(({ sales, products, categories }) => {
        console.log('Calculando reporte desde ventas, productos y categorías');
        console.log('Ventas:', sales.length);
        console.log('Productos:', products.length);
        console.log('Categorías:', categories.length);

        let filteredSales = sales;
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          filteredSales = sales.filter((sale: Sale) => {
            const saleDate = new Date(sale.created_at);
            return saleDate >= start && saleDate <= end;
          });
        }

        console.log('Ventas filtradas:', filteredSales.length);

        const totalIngresos = filteredSales.reduce((sum: number, sale: Sale) =>
          sum + (Number(sale.total) || 0), 0
        );
        const totalTransacciones = filteredSales.length;

        const productSales = new Map<number, { quantity: number, product: any }>();

        filteredSales.forEach((sale: Sale) => {
          if (sale.details && Array.isArray(sale.details)) {
            sale.details.forEach(detail => {
              const current = productSales.get(detail.product) || { quantity: 0, product: null };
              current.quantity += detail.quantity;
              productSales.set(detail.product, current);
            });
          }
        });

        console.log('Productos vendidos:', productSales.size);

        const topProducts = Array.from(productSales.entries())
          .map(([productId, data]) => {
            const product = products.find((p: any) => p.id === productId);
            let categoryName = 'Sin categoría';

            if (product?.category) {
              if (typeof product.category === 'number') {
                const category = categories.find((c: any) => c.id === product.category);
                categoryName = category?.name || 'Sin categoría';
              }
              else if (typeof product.category === 'object' && product.category.name) {
                categoryName = product.category.name;
              }
              else if (typeof product.category === 'string') {
                categoryName = product.category;
              }
            }

            return {
              id: productId,
              name: product?.name || 'Producto desconocido',
              sold: data.quantity,
              category: categoryName
            };
          })
          .sort((a, b) => b.sold - a.sold)
          .slice(0, 10);

        console.log('Top productos:', topProducts);

        return {
          totalIngresos,
          totalTransacciones,
          topProducts
        };
      }),
      catchError(error => {
        console.error('Error calculando reporte:', error);
        return of({
          totalIngresos: 0,
          totalTransacciones: 0,
          topProducts: []
        });
      })
    );
  }

  getInventoryReport(threshold: number = 10): Observable<any> {
    return this.http.get<any>(`${apiUrl}/products/`).pipe(
      map(response => {
        const products = response.results || response || [];
        const lowStock = products.filter((p: any) => p.stock < threshold);
        return {
          products: lowStock,
          threshold
        };
      }),
      catchError(error => {
        console.error('Error en getInventoryReport:', error);
        return of({ products: [], threshold });
      })
    );
  }

  getTopProducts(limit: number = 10): Observable<any> {
    return this.getSalesReport().pipe(
      map(report => ({
        products: report.topProducts.slice(0, limit)
      }))
    );
  }
}
