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
import { EmployeeManagementComponent } from './screens/dashboard/employees/employee-management/employee-management.component';
import { ActivateAccountComponent } from './screens/auth/activate-account/activate-account.component';
import { ForgotPasswordComponent } from './screens/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './screens/auth/reset-password/reset-password.component';
import { StoreSettingsComponent } from './screens/dashboard/store-settings/store-settings.component';

import { ForceChangePasswordComponent } from './screens/auth/force-change-password/force-change-password.component';
import { SetupComponent } from './screens/dashboard/setup/setup.component';
import { AnalyticsDashboardComponent } from './screens/dashboard/analytics/analytics-dashboard/analytics-dashboard.component';

import { authGuard } from './shared/guards/auth.guard';
import { roleGuard } from './shared/guards/role.guard';
import { setupGuard } from './shared/guards/setup.guard';
import { PremiumUpgradeComponent } from './screens/dashboard/premium/premium-upgrade/premium-upgrade.component';

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
  {
    path: 'activate/:uid/:token',
    component: ActivateAccountComponent
  },
  {
    path: 'auth/forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'reset-password/:uid/:token',
    component: ResetPasswordComponent
  },

  {
    path: 'auth/force-change-password',
    component: ForceChangePasswordComponent,
    canActivate: [authGuard]
  },

  // --- RUTAS PRIVADAS ---
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: HomeComponent,
        canActivate: [setupGuard]
      },
      // --- RUTA DE SETUP (Solo Admin) ---
      {
        path: 'setup',
        component: SetupComponent,
        canActivate: [roleGuard],
        data: { expectedRoles: ['Admin'] }
      },
      // --- RUTA DE PERFIL  ---
      {
        path: 'profile',
        component: ProfileEditComponent,
        canActivate: [setupGuard]
      },
      // --- RUTA DE EMPLEADOS ---
      {
        path: 'employees',
        component: EmployeeManagementComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] }
      },
      // --- RUTA DE CONFIGURACIÓN DE TIENDA ---
      {
        path: 'settings',
        component: StoreSettingsComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] }
      },
      // --- RUTAS DE CAJERO Y ADMIN ---
      { path: 'sales/pos', component: PosComponent, canActivate: [setupGuard] },
      { path: 'sales/history', component: SaleHistoryComponent, canActivate: [setupGuard] },

      // --- RUTAS DE PRODUCTOS ---
      {
        path: 'products/new',
        component: ProductFormComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] }
      },
      {
        path: 'products/edit/:id',
        component: ProductFormComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] }
      },
      {
        path: 'products',
        component: ProductListComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] }
      },
      // --- RUTAS DE CATEGORÍAS ---
      {
        path: 'categories/new',
        component: CategoryFormComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] }
      },
      {
        path: 'categories/edit/:id',
        component: CategoryFormComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] }
      },
      {
        path: 'categories',
        component: CategoryListComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] }
      },

      // --- RUTAS DE CLIENTES (Solo Admin) ---
      {
        path: 'clients/new',
        component: ClientFormComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] }
      },
      {
        path: 'clients/edit/:id',
        component: ClientFormComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] }
      },
      {
        path: 'clients',
        component: ClientListComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] }
      },

      // --- RUTAS DE INVENTARIO Y REPORTES ---
      {
        path: 'inventory',
        component: InventoryAdjustComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] }
      },
      {
        path: 'analytics',
        component: AnalyticsDashboardComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] }
      },
      {
        path: 'premium',
        component: PremiumUpgradeComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] }
      },
      {
        path: 'reports',
        component: ReportListComponent,
        canActivate: [roleGuard, setupGuard],
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
