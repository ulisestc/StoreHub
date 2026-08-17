import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { LoadingService } from './services/loading.service';
import { OfflineSyncService } from './services/offline-sync.service';
import { CategoryService } from './services/category.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'StoreHub';
  loading$;
  isOnline$;

  constructor(
    public loadingService: LoadingService,
    private offlineSync: OfflineSyncService,
    private categoryService: CategoryService,
    private authService: AuthService
  ) {
    this.loading$ = this.loadingService.loading$;
    this.isOnline$ = this.offlineSync.isOnline;

    // Iniciar caché offline si el usuario tiene sesión activa y hay internet
    if (this.authService.isLoggedIn() && navigator.onLine) {
      this.offlineSync.syncOfflineCatalog();
      this.categoryService.getCategories().subscribe();
    }
  }
}
