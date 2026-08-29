import { Routes } from '@angular/router';

import { LandingComponent } from './screens/landing/landing.component';
import { PricingComponent } from './screens/pricing/pricing.component';
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
import { Title } from 'chart.js';

export const routes: Routes = [
  // --- RUTAS PÚBLICAS ---
  {
    path: '',
    component: LandingComponent,
    title: 'StoreHub | Sistema de Punto de Venta'
  },
  {
    path: 'planes',
    component: PricingComponent,
    title: 'Planes y Precios | StoreHub'
  },
  // Rutas de Autenticación
  {
    path: 'auth/login',
    component: LoginComponent,
    title: 'Iniciar Sesión | StoreHub'
  },
  {
    path: 'auth/register',
    component: RegisterComponent,
    title: 'Registro de Usuario | StoreHub'
  },
  {
    path: 'activate/:uid/:token',
    component: ActivateAccountComponent,
    title: 'Activar Cuenta | StoreHub'
  },
  {
    path: 'auth/forgot-password',
    component: ForgotPasswordComponent,
    title: 'Recuperar Contraseña | StoreHub'
  },
  {
    path: 'reset-password/:uid/:token',
    component: ResetPasswordComponent,
    title: 'Restablecer Contraseña | StoreHub'
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
        canActivate: [setupGuard],
        title: 'Inicio | StoreHub'
      },
      // --- RUTA DE SETUP (Solo Admin) ---
      {
        path: 'setup',
        component: SetupComponent,
        canActivate: [roleGuard],
        data: { expectedRoles: ['Admin'] },
        title: 'Configuración Inicial | StoreHub'
      },
      // --- RUTA DE PERFIL  ---
      {
        path: 'profile',
        component: ProfileEditComponent,
        canActivate: [setupGuard],
        title: 'Editar Perfil | StoreHub'
      },
      // --- RUTA DE EMPLEADOS ---
      {
        path: 'employees',
        component: EmployeeManagementComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] },
        title: 'Gestión de Empleados | StoreHub'
      },
      // --- RUTA DE CONFIGURACIÓN DE TIENDA ---
      {
        path: 'settings',
        component: StoreSettingsComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] },
        title: 'Configuración de Tienda | StoreHub'
      },
      // --- RUTAS DE CAJERO Y ADMIN ---
      { path: 'sales/pos', component: PosComponent, canActivate: [setupGuard] , title: 'Punto de Venta | StoreHub' },
      { path: 'sales/history', component: SaleHistoryComponent, canActivate: [setupGuard], title: 'Historial de Ventas | StoreHub' },
      { 
        path: 'sales/cash-register-history', 
        loadComponent: () => import('./screens/dashboard/sales/cash-register-history/cash-register-history.component').then(m => m.CashRegisterHistoryComponent),
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] },
        title: 'Historial de Caja | StoreHub' 
      },

      // --- RUTAS DE PRODUCTOS ---
      {
        path: 'products/new',
        component: ProductFormComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] },
        title: 'Nuevo Producto | StoreHub'
      },
      {
        path: 'products/edit/:id',
        component: ProductFormComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] },
        title: 'Editar Producto | StoreHub'
      },
      {
        path: 'products',
        component: ProductListComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] },
        title: 'Lista de Productos | StoreHub'
      },
      // --- RUTAS DE CATEGORÍAS ---
      {
        path: 'categories/new',
        component: CategoryFormComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] },
        title: 'Nueva Categoría | StoreHub'
      },
      {
        path: 'categories/edit/:id',
        component: CategoryFormComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] },
        title: 'Editar Categoría | StoreHub'
      },
      {
        path: 'categories',
        component: CategoryListComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] },
        title: 'Lista de Categorías | StoreHub'
      },

      // --- RUTAS DE CLIENTES (Solo Admin) ---
      {
        path: 'clients/new',
        component: ClientFormComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] },
        title: 'Nuevo Cliente | StoreHub'
      },
      {
        path: 'clients/edit/:id',
        component: ClientFormComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] },
        title: 'Editar Cliente | StoreHub'
      },
      {
        path: 'clients',
        component: ClientListComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] },
        title: 'Lista de Clientes | StoreHub'
      },

      // --- RUTAS DE INVENTARIO Y REPORTES ---
      {
        path: 'inventory',
        component: InventoryAdjustComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] },
        title: 'Ajustes de Inventario | StoreHub'
      },
      {
        path: 'analytics',
        component: AnalyticsDashboardComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] },
        title: 'Análisis y Métricas | StoreHub'
      },
      {
        path: 'premium',
        component: PremiumUpgradeComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] },
        title: 'Mejorar a Premium | StoreHub'
      },
      {
        path: 'reports',
        component: ReportListComponent,
        canActivate: [roleGuard, setupGuard],
        data: { expectedRoles: ['Admin'] },
        title: 'Reportes | StoreHub'
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
