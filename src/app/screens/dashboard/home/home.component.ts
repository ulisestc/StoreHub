import { Component, OnInit, inject } from '@angular/core'; // 1. Importa OnInit
import { CommonModule } from '@angular/common'; // 2. Importa CommonModule
import { RouterModule } from '@angular/router'; // 3. Importa RouterModule

// Importaciones de Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

// Servicio
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true, // 4. Asegúrate de que standalone sea true
  imports: [
    // 5. Añade todos los imports
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit { // 6. Implementa OnInit

  userRole: 'Admin' | 'Cajero' | null = null;
  userName: string = 'Usuario'; // Nombre simulado

  private authService = inject(AuthService);

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();

    // Simulación de nombre
    if (this.userRole === 'Admin') {
      this.userName = 'Administrador';
    } else if (this.userRole === 'Cajero') {
      this.userName = 'Cajero';
    }
  }
}
