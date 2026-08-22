import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { AnalyticsService } from '../../../../services/analytics.service';
import { AuthService } from '../../../../services/auth.service';

type ViewState = 'plans' | 'checkout' | 'processing' | 'success' | 'manage';

@Component({
  selector: 'app-premium-upgrade',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule
  ],
  templateUrl: './premium-upgrade.component.html',
  styleUrls: ['./premium-upgrade.component.scss']
})
export class PremiumUpgradeComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private authService = inject(AuthService);
  private router = inject(Router);

  viewState: ViewState = 'plans';
  isPremium = false;
  isLoading = false;
  showCancelConfirm = false;

  // Simulated payment form (pre-filled for demo)
  cardNumber = '4242 4242 4242 4242';
  cardName = 'Usuario de Prueba';
  cardExpiry = '12/28';
  cardCvc = '123';
  cardError = '';

  ngOnInit() {
    this.isPremium = this.authService.isPremium();
    this.authService.getUserProfile().subscribe({
      next: (profile) => {
        if (profile.store) {
          this.isPremium = profile.store.is_premium;
          this.viewState = this.isPremium ? 'manage' : 'plans';

          const tokenDataStr = localStorage.getItem('authTokenData');
          if (tokenDataStr) {
            const tokenData = JSON.parse(tokenDataStr);
            tokenData.isPremium = this.isPremium;
            localStorage.setItem('authTokenData', JSON.stringify(tokenData));
          }
        }
      },
      error: () => {
        this.viewState = this.isPremium ? 'manage' : 'plans';
      }
    });
  }

  openCheckout() {
    this.viewState = 'checkout';
    this.cardError = '';
  }

  goBackToPlans() {
    this.viewState = 'plans';
    this.resetForm();
  }

  formatCardNumber() {
    // Strip non-digits, limit to 16, add spaces every 4
    let raw = this.cardNumber.replace(/\D/g, '').slice(0, 16);
    this.cardNumber = raw.replace(/(.{4})/g, '$1 ').trim();
  }

  formatExpiry() {
    let raw = this.cardExpiry.replace(/\D/g, '').slice(0, 4);
    if (raw.length > 2) {
      this.cardExpiry = raw.slice(0, 2) + '/' + raw.slice(2);
    } else {
      this.cardExpiry = raw;
    }
  }

  isFormValid(): boolean {
    const digits = this.cardNumber.replace(/\s/g, '');
    return digits.length === 16
      && this.cardName.trim().length >= 3
      && /^\d{2}\/\d{2}$/.test(this.cardExpiry)
      && /^\d{3,4}$/.test(this.cardCvc);
  }

  processPayment() {
    if (!this.isFormValid()) {
      this.cardError = 'Por favor completa todos los campos correctamente.';
      return;
    }

    this.cardError = '';
    this.viewState = 'processing';

    // Simulate payment processing delay
    setTimeout(() => {
      this.analyticsService.upgradeToPremium().subscribe({
        next: () => {
          this.isPremium = true;
          this.viewState = 'success';

          const tokenDataStr = localStorage.getItem('authTokenData');
          if (tokenDataStr) {
            const tokenData = JSON.parse(tokenDataStr);
            tokenData.isPremium = true;
            localStorage.setItem('authTokenData', JSON.stringify(tokenData));
          }

          setTimeout(() => {
            window.location.href = '/dashboard/premium';
          }, 2500);
        },
        error: () => {
          this.cardError = 'Error al procesar el pago. Intenta de nuevo.';
          this.viewState = 'checkout';
        }
      });
    }, 2000);
  }

  toggleCancelConfirm() {
    this.showCancelConfirm = !this.showCancelConfirm;
  }

  cancelPremium() {
    this.isLoading = true;
    this.analyticsService.cancelPremium().subscribe({
      next: () => {
        this.isLoading = false;
        this.isPremium = false;

        const tokenDataStr = localStorage.getItem('authTokenData');
        if (tokenDataStr) {
          const tokenData = JSON.parse(tokenDataStr);
          tokenData.isPremium = false;
          localStorage.setItem('authTokenData', JSON.stringify(tokenData));
        }

        window.location.href = '/dashboard/premium';
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private resetForm() {
    this.cardNumber = '';
    this.cardName = '';
    this.cardExpiry = '';
    this.cardCvc = '';
    this.cardError = '';
  }
}
