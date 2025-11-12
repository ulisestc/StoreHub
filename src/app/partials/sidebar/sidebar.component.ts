import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {

  authService = inject(AuthService);
  userRole: 'Admin' | 'Cajero' | null = null;

  // ngOnInit se ejecuta cuando el componente se inicia
  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
  }
}
