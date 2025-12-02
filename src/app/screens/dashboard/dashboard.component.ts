import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../partials/navbar/navbar.component';
import { SidebarComponent } from '../../partials/sidebar/sidebar.component';
import { FooterComponent } from '../../partials/footer/footer.component';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterModule,
    NavbarComponent,
    SidebarComponent,
    FooterComponent,
    MatSidenavModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  isDesktop: boolean = true;

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
  }

  checkScreenSize(): void {
    this.isDesktop = window.innerWidth >= 968;
  }
}
