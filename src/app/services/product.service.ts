import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../shared/interfaces/product';
import { environment } from '../../environments/environment';

const apiUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) { }


getProducts(search?: string, categoryId?: number | string): Observable<Product[]> {
    let params = new HttpParams();
    // metemos parametros si hay
    if (search) {
      params = params.set('search', search);
    }
    if (categoryId) {
      params = params.set('category', categoryId);
    }
    return this.http.get<any>(`${apiUrl}/products/`, { params }).pipe(
      map(response => response.results || response)
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

  decreaseStock(productId: string, quantity: number): Observable<any> {
    return this.http.post(`${apiUrl}/products/${productId}/decrease-stock/`, {
      quantity: quantity
    });
  }
}
