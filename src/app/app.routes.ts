import { Routes } from '@angular/router';

// Importa tus componentes
import { LandingComponent } from './screens/landing/landing.component';
import { LoginComponent } from './screens/auth/login/login.component';
import { RegisterComponent } from './screens/auth/register/register.component';
import { DashboardComponent } from './screens/dashboard/dashboard.component';
import { HomeComponent } from './screens/dashboard/home/home.component';

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
    // Estas son las "Rutas Hijas" que se cargarán dentro del <router-outlet> del Dashboard
    children: [
      {
        path: '', // Esta es la ruta por defecto (ej. /dashboard)
        component: HomeComponent
      },
      // Aquí irán las rutas de Persona 2 y 3 (productos, reportes, etc.)
      // { path: 'products', component: ProductsComponent },
      // { path: 'reports', component: ReportsComponent },
    ]
  },

  // --- REDIRECCIÓN ---
  // Cualquier otra ruta que no exista, redirige a la Landing Page
  {
    path: '**',
    redirectTo: ''
  }
];
