import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PrinterService, PrinterSettings } from '../../services/printer.service';

@Component({
  selector: 'app-hardware-settings-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule
  ],
  templateUrl: './hardware-settings-modal.component.html',
  styleUrls: ['./hardware-settings-modal.component.scss']
})
export class HardwareSettingsModalComponent implements OnInit {
  settings: PrinterSettings = { paperSize: '58mm' };
  isConnected$;
  accessDeniedError = false;
  interfaceClaimError = false;
  currentOS = 'Desconocido';

  constructor(
    public dialogRef: MatDialogRef<HardwareSettingsModalComponent>,
    private printerService: PrinterService,
    private snackBar: MatSnackBar
  ) {
    this.isConnected$ = this.printerService.isConnected$;
  }

  ngOnInit(): void {
    this.settings = this.printerService.getSettings();
    this.detectOS();
  }

  detectOS(): void {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('win')) {
      this.currentOS = 'Windows';
    } else if (userAgent.includes('mac')) {
      this.currentOS = 'Mac';
    } else if (userAgent.includes('linux')) {
      this.currentOS = 'Linux';
    } else {
      this.currentOS = 'Otro';
    }
  }

  saveSettings(): void {
    this.printerService.saveSettings(this.settings);
  }

  async connectPrinter(): Promise<void> {
    this.accessDeniedError = false;
    this.interfaceClaimError = false;
    try {
      await this.printerService.connect();
    } catch (error: any) {
      if (error.message && error.message.toLowerCase().includes('access denied')) {
        this.accessDeniedError = true;
      } else if (error.message && error.message.toLowerCase().includes('claim')) {
        this.interfaceClaimError = true;
      } else {
        this.snackBar.open(`Error al conectar: ${error.message || 'Desconocido'}`, 'Cerrar', { duration: 5000, panelClass: ['snackbar-error'] });
      }
    }
  }

  async disconnectPrinter(): Promise<void> {
    await this.printerService.disconnect();
  }

  async testPrint(): Promise<void> {
    await this.printerService.testPrint();
  }

  close(): void {
    this.dialogRef.close();
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Could show a snackbar here, but standard copy is usually enough.
      console.log('Texto copiado al portapapeles');
    });
  }
}
