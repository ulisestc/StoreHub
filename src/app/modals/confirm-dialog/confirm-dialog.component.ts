import { Component, Inject } from '@angular/core'; // Importa Inject
import { CommonModule } from '@angular/common';

// Importaciones de Material para el Diálogo
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {

  // Inyectamos MAT_DIALOG_DATA para recibir datos
  // Inyectamos MatDialogRef para poder cerrar el diálogo
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, message: string }
  ) { }

  onNoClick(): void {
    this.dialogRef.close(false); // Cierra el diálogo y devuelve 'false'
  }

  onYesClick(): void {
    this.dialogRef.close(true); // Cierra el diálogo y devuelve 'true'
  }
}
