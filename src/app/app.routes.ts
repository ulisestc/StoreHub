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
import { CategoryFormComponent } from './screens/dashboard/categories/category-form/category-form.component';

import { ClientListComponent } from './screens/dashboard/clients/client-list/client-list.component';
import { ClientFormComponent } from './screens/dashboard/clients/client-form/client-form.component';

import { ProfileEditComponent } from './screens/dashboard/profile/profile-edit/profile-edit.component';

import { authGuard } from './shared/guards/auth.guard';

import { roleGuard } from './shared/guards/role.guard';

export const routes: Routes = [
  // --- RUTAS PÚBLICAS ---
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

  // --- RUTAS PRIVADAS ---
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: HomeComponent
      },
      // --- RUTA DE PERFIL  ---
      {
        path: 'profile',
        component: ProfileEditComponent
      },
      // --- RUTAS DE CAJERO Y ADMIN ---
      { path: 'sales/pos', component: PosComponent },
      { path: 'sales/history', component: SaleHistoryComponent },

      // --- RUTAS DE PRODUCTOS ---
      {
        path: 'products/new',
        component: ProductFormComponent,
        canActivate: [roleGuard],
        data: { expectedRoles: ['Admin'] }
      },
      {
        path: 'products/edit/:id',
        component: ProductFormComponent,
        canActivate: [roleGuard],
        data: { expectedRoles: ['Admin'] }
      },
      {
        path: 'products',
        component: ProductListComponent,
        canActivate: [roleGuard],
        data: { expectedRoles: ['Admin'] }
      },
      // --- RUTAS DE CATEGORÍAS ---
      {
        path: 'categories/new',
        component: CategoryFormComponent,
        canActivate: [roleGuard],
        data: { expectedRoles: ['Admin'] }
      },
      {
        path: 'categories/edit/:id',
        component: CategoryFormComponent,
        canActivate: [roleGuard],
        data: { expectedRoles: ['Admin'] }
      },
      {
        path: 'categories',
        component: CategoryListComponent,
        canActivate: [roleGuard],
        data: { expectedRoles: ['Admin'] }
      },

      // --- RUTAS DE CLIENTES (Solo Admin) ---
      {
        path: 'clients/new',
        component: ClientFormComponent,
        canActivate: [roleGuard],
        data: { expectedRoles: ['Admin'] }
      },
      {
        path: 'clients/edit/:id',
        component: ClientFormComponent,
        canActivate: [roleGuard],
        data: { expectedRoles: ['Admin'] }
      },
      {
        path: 'clients',
        component: ClientListComponent,
        canActivate: [roleGuard],
        data: { expectedRoles: ['Admin'] }
      },

      // --- RUTAS DE INVENTARIO Y REPORTES ---
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
