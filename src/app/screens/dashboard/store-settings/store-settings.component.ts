import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StoreService } from '../../../services/store.service';
import { AuthService } from '../../../services/auth.service';

import { MatSelectModule } from '@angular/material/select';

export interface CountryPreset {
  country: string;
  currencyCode: string;
  currencySymbol: string;
  taxRatePercent: number;
  taxName: string;
}

export const COUNTRY_PRESETS: CountryPreset[] = [
  { country: 'Colombia', currencyCode: 'COP', currencySymbol: '$', taxRatePercent: 19, taxName: 'IVA' },
  { country: 'México', currencyCode: 'MXN', currencySymbol: '$', taxRatePercent: 16, taxName: 'IVA' },
  { country: 'Chile', currencyCode: 'CLP', currencySymbol: '$', taxRatePercent: 19, taxName: 'IVA' },
  { country: 'Perú', currencyCode: 'PEN', currencySymbol: 'S/', taxRatePercent: 18, taxName: 'IGV' },
  { country: 'Argentina', currencyCode: 'ARS', currencySymbol: '$', taxRatePercent: 21, taxName: 'IVA' },
  { country: 'Ecuador', currencyCode: 'USD', currencySymbol: '$', taxRatePercent: 15, taxName: 'IVA' },
  { country: 'Guatemala', currencyCode: 'GTQ', currencySymbol: 'Q', taxRatePercent: 12, taxName: 'IVA' },
  { country: 'Costa Rica', currencyCode: 'CRC', currencySymbol: '₡', taxRatePercent: 13, taxName: 'IVA' },
  { country: 'Panamá', currencyCode: 'USD', currencySymbol: '$', taxRatePercent: 7, taxName: 'ITBMS' },
  { country: 'República Dominicana', currencyCode: 'DOP', currencySymbol: 'RD$', taxRatePercent: 18, taxName: 'ITBIS' },
  { country: 'España', currencyCode: 'EUR', currencySymbol: '€', taxRatePercent: 21, taxName: 'IVA' },
  { country: 'Estados Unidos', currencyCode: 'USD', currencySymbol: '$', taxRatePercent: 0, taxName: 'Sales Tax' }
];

@Component({
  selector: 'app-store-settings',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatSelectModule
  ],
  templateUrl: './store-settings.component.html',
  styleUrls: ['./store-settings.component.scss']
})
export class StoreSettingsComponent implements OnInit {
  storeForm: FormGroup;
  isLoading = false;
  countryPresets = COUNTRY_PRESETS;

  constructor(
    private fb: FormBuilder,
    private storeService: StoreService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.storeForm = this.fb.group({
      name: ['', Validators.required],
      address: [''],
      phone: [''],
      email: ['', [Validators.email]],
      receipt_message: [''],
      country: ['Colombia', Validators.required],
      currency_code: ['COP', Validators.required],
      currency_symbol: ['$', Validators.required],
      tax_rate_percent: [19, [Validators.required, Validators.min(0), Validators.max(100)]],
      tax_name: ['IVA', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadStoreConfig();
  }

  get selectedPreset(): CountryPreset {
    const selectedCountry = this.storeForm.get('country')?.value || 'Colombia';
    return this.countryPresets.find(p => p.country === selectedCountry) || this.countryPresets[0];
  }

  onCountryChange(countryName: string): void {
    const preset = this.countryPresets.find(p => p.country === countryName) || this.countryPresets[0];
    this.storeForm.patchValue({
      country: preset.country,
      currency_code: preset.currencyCode,
      currency_symbol: preset.currencySymbol,
      tax_rate_percent: preset.taxRatePercent,
      tax_name: preset.taxName
    });
  }

  loadStoreConfig(): void {
    this.storeService.getStoreConfig().subscribe({
      next: (config) => {
        const ratePercent = config.tax_rate !== undefined && config.tax_rate !== null
          ? Math.round(Number(config.tax_rate) * 100 * 100) / 100
          : 19;

        this.storeForm.patchValue({
          name: config.name,
          address: config.address || '',
          phone: config.phone || '',
          email: config.email || '',
          receipt_message: config.receipt_message || '',
          country: config.country || 'Colombia',
          currency_code: config.currency_code || 'COP',
          currency_symbol: config.currency_symbol || '$',
          tax_rate_percent: ratePercent,
          tax_name: config.tax_name || 'IVA'
        });
      },
      error: () => {
        this.snackBar.open('Error al cargar configuración de la tienda', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onSave(): void {
    if (this.storeForm.invalid) return;

    this.isLoading = true;
    const formVal = this.storeForm.value;
    const payload = {
      name: formVal.name,
      address: formVal.address,
      phone: formVal.phone,
      email: formVal.email,
      receipt_message: formVal.receipt_message,
      country: formVal.country,
      currency_code: formVal.currency_code,
      currency_symbol: formVal.currency_symbol,
      tax_rate: (formVal.tax_rate_percent / 100),
      tax_name: formVal.tax_name
    };

    this.storeService.updateStoreConfig(payload).subscribe({
      next: (updatedConfig) => {
        // Sincronizar en el servicio local de autenticación
        this.authService.updateLocalStoreConfig(updatedConfig);

        this.snackBar.open('Configuración regional y de tienda guardada correctamente', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Error al guardar la configuración', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }
}
