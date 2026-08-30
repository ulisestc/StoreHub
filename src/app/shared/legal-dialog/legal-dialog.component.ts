import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type LegalDialogType = 'terms' | 'privacy';

@Component({
  selector: 'app-legal-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './legal-dialog.component.html',
  styleUrl: './legal-dialog.component.scss'
})
export class LegalDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<LegalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { type: LegalDialogType }
  ) {}

  close() {
    this.dialogRef.close();
  }
}
