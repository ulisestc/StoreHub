import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Category } from '../shared/interfaces/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  // Datos simulados
  private mockCategories: Category[] = [
    { id: '1', nombre: 'Electrónica', descripcion: 'Dispositivos y gadgets' },
    { id: '2', nombre: 'Accesorios', descripcion: 'Complementos para dispositivos' },
    { id: '3', nombre: 'Ropa', descripcion: 'Vestimenta y moda' }
  ];

  constructor() { }

  // --- LEER TODAS ---
  getCategories(): Observable<Category[]> {
    return of(this.mockCategories);
  }

  // --- LEER UNA ---
  getCategoryById(id: string): Observable<Category | undefined> {
    const category = this.mockCategories.find(c => c.id === id);
    return of(category);
  }

  // --- BORRAR ---
  deleteCategory(id: string): Observable<boolean> {
    const index = this.mockCategories.findIndex(c => c.id === id);
    if (index > -1) {
      this.mockCategories.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  // --- CREAR (Simulado) ---
  createCategory(category: Omit<Category, 'id'>): Observable<Category> {
    const newCategory: Category = {
      id: new Date().getTime().toString(),
      ...category
    };
    this.mockCategories.push(newCategory);
    return of(newCategory);
  }

  // --- ACTUALIZAR (Simulado) ---
  updateCategory(id: string, categoryData: Category): Observable<Category | undefined> {
    const index = this.mockCategories.findIndex(c => c.id === id);
    if (index > -1) {
      this.mockCategories[index] = { ...categoryData, id: id };
      return of(this.mockCategories[index]);
    }
    return of(undefined);
  }
}
