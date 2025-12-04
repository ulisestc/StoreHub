import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Product } from '../shared/interfaces/product';
import { CategoryService } from './category.service';
import { environment } from '../../environments/environment';

const apiUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private categoryService = inject(CategoryService);

  constructor(private http: HttpClient) { }

  getProducts(search?: string, categoryId?: number | string, page?: number, pageSize: number = 10): Observable<{count: number, results: Product[]}> {
    let params = new HttpParams();

    if (search) {
      params = params.set('search', search);
    }
    if (categoryId) {
      params = params.set('category', categoryId);
    }
    if (page) {
      params = params.set('page', page.toString());
      params = params.set('page_size', pageSize.toString());
    }

    return this.http.get<any>(`${apiUrl}/products/`, { params }).pipe(
      map((response) => {
        if (response && response.results) {
          return {
            count: response.count || 0,
            results: response.results || []
          };
        } else if (Array.isArray(response)) {
          return {
            count: response.length,
            results: response
          };
        } else {
          return {
            count: 0,
            results: []
          };
        }
      })
    );
  }

  getProductsPaginated(page: number = 1, pageSize: number = 10): Observable<{count: number, results: Product[]}> {
    return forkJoin({
      productsData: this.http.get<any>(`${apiUrl}/products/?page=${page}&page_size=${pageSize}`),
      categories: this.categoryService.getCategories()
    }).pipe(
      map(({productsData, categories}) => {
        const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));

        let products: Product[];
        let count: number;

        if (productsData && productsData.results && Array.isArray(productsData.results)) {
          products = productsData.results;
          count = productsData.count || products.length;
        } else if (Array.isArray(productsData)) {
          products = productsData;
          count = products.length;
        } else {
          products = [];
          count = 0;
        }

        const productsWithCategoryName = products.map(product => ({
          ...product,
          categoryName: categoryMap.get(product.category) || 'Sin categoría'
        }));

        return {
          count,
          results: productsWithCategoryName
        };
      })
    );
  }

  getProductsCount(): Observable<number> {
    return this.http.get<any>(`${apiUrl}/products/?page=1&page_size=1`).pipe(
      map(response => response.count || 0)
    );
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${apiUrl}/products/${id}/`);
  }

  createProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(`${apiUrl}/products/`, product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${apiUrl}/products/${id}/`, product);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${apiUrl}/products/${id}/`);
  }

}
