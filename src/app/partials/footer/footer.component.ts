import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LegalDialogComponent, LegalDialogType } from '../../shared/legal-dialog/legal-dialog.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatDialogModule
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
  private dialog = inject(MatDialog);

  openLegal(type: LegalDialogType) {
    this.dialog.open(LegalDialogComponent, {
      data: { type },
      width: '680px',
      maxHeight: '85vh',
      panelClass: 'legal-dialog-panel'
    });
  }
}
