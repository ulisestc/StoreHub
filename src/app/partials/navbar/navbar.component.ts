import { Component, inject, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  // Se inyecta el servicio
  authService = inject(AuthService);

  @Output() menuToggle = new EventEmitter<void>();

  // étodo para el botón del menú
  onMenuToggle() {
    this.menuToggle.emit();
  }

  // Método que llamará el botón
  logout() {
    this.authService.logout();
  }
}
