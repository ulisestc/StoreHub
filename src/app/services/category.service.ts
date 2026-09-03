import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { Category } from '../shared/interfaces/category';
import { environment } from '../../environments/environment';

const apiUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http: HttpClient) { }

  getCategories(): Observable<Category[]> {
    const isOfflineFlag = localStorage.getItem('storehub_is_offline') === 'true';
    if (!navigator.onLine || isOfflineFlag) {
      const cached = localStorage.getItem('storehub_categories');
      return of(cached ? JSON.parse(cached) : []);
    }

    return this.http.get<any>(`${apiUrl}/categories/`).pipe(
      map(response => response.results || response),
      tap(categories => {
        localStorage.setItem('storehub_categories', JSON.stringify(categories));
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0 || error.status === 502 || error.status === 504 || error.status === 500) {
          const cached = localStorage.getItem('storehub_categories');
          return of(cached ? JSON.parse(cached) : []);
        }
        return throwError(() => error);
      })
    );
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${apiUrl}/categories/${id}/`);
  }

  createCategory(category: Omit<Category, 'id'>): Observable<Category> {
    return this.http.post<Category>(`${apiUrl}/categories/`, category);
  }

  updateCategory(id: string, categoryData: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${apiUrl}/categories/${id}/`, categoryData);
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${apiUrl}/categories/${id}/`);
  }
}
