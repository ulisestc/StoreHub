import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../shared/interfaces/product';
import { environment } from '../../environments/environment';

const apiUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${apiUrl}/products/`);
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
