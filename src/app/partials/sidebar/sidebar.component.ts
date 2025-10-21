import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {

  authService = inject(AuthService);
  userRole: 'Admin' | 'Cajero' | null = null;

  // ngOnInit se ejecuta cuando el componente se inicia
  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
  }
}
