import { Routes } from '@angular/router';

import { LandingComponent } from './screens/landing/landing.component';
import { LoginComponent } from './screens/auth/login/login.component';
import { RegisterComponent } from './screens/auth/register/register.component';
import { DashboardComponent } from './screens/dashboard/dashboard.component';
import { HomeComponent } from './screens/dashboard/home/home.component';

import { ProductListComponent } from './screens/dashboard/products/product-list/product-list.component';
import { ReportListComponent } from './screens/dashboard/reports/report-list/report-list.component';
import { InventoryAdjustComponent } from './screens/dashboard/inventory/inventory-adjust/inventory-adjust.component';
import { CategoryListComponent } from './screens/dashboard/categories/category-list/category-list.component';

import { PosComponent } from './screens/dashboard/sales/pos/pos.component';
import { SaleHistoryComponent } from './screens/dashboard/sales/sale-history/sale-history.component';

import { ProductFormComponent } from './screens/dashboard/products/product-form/product-form.component';

// Se importa el Guard
import { authGuard } from './shared/guards/auth.guard';

// Se importa el guard de rol
import { roleGuard } from './shared/guards/role.guard';

export const routes: Routes = [
  // --- RUTAS PÚBLICAS ---
  // La Landing Page será la ruta raíz
  {
    path: '',
    component: LandingComponent
  },
  // Rutas de Autenticación
  {
    path: 'auth/login',
    component: LoginComponent
  },
  {
    path: 'auth/register',
    component: RegisterComponent
  },

  // --- RUTAS PRIVADAS (Protegidas) ---
  // Usamos el DashboardComponent como layout principal
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard], // Se aplica el Guard aquí
    // Estas son las "Rutas Hijas" que se cargarán dentro del <router-outlet> del Dashboard
    children: [
      {
        path: '', // Esta es la ruta por defecto (ej. /dashboard)
        component: HomeComponent
      },
      // --- RUTAS DE CAJERO Y ADMIN (Persona 3) ---
      // No necesitan RoleGuard porque el AuthGuard ya hizo el trabajo
      // y el Sidebar los muestra a ambos.
      { path: 'sales/pos', component: PosComponent },
      { path: 'sales/history', component: SaleHistoryComponent },

      // --- NUEVAS RUTAS DE PRODUCTOS ---
      {
        path: 'products/new', // Ruta para crear
        component: ProductFormComponent,
        canActivate: [roleGuard],
        data: { expectedRoles: ['Admin'] }
      },
      {
        path: 'products/edit/:id', // Ruta para editar
        component: ProductFormComponent,
        canActivate: [roleGuard],
        data: { expectedRoles: ['Admin'] }
      },
      // Aquí aplicamos el RoleGuard
      {
        path: 'products',
        component: ProductListComponent,
        canActivate: [roleGuard], // <-- Aplicamos el guard
        data: { expectedRoles: ['Admin'] } // <-- Le decimos al guard qué rol esperamos
      },
      {
        path: 'categories',
        component: CategoryListComponent,
        canActivate: [roleGuard],
        data: { expectedRoles: ['Admin'] }
      },
      {
        path: 'inventory',
        component: InventoryAdjustComponent,
        canActivate: [roleGuard],
        data: { expectedRoles: ['Admin'] }
      },
      {
        path: 'reports',
        component: ReportListComponent,
        canActivate: [roleGuard],
        data: { expectedRoles: ['Admin'] }
      },
    ]
  },

  // --- REDIRECCIÓN ---
  // Cualquier otra ruta que no exista, redirige a la Landing Page
  {
    path: '**',
    redirectTo: ''
  }
];
