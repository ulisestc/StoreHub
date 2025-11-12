import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../partials/navbar/navbar.component';
import { SidebarComponent } from '../../partials/sidebar/sidebar.component';

import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-dashboard',
  standalone: true,

  imports: [
    RouterModule,
    NavbarComponent,
    SidebarComponent,
    MatSidenavModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
