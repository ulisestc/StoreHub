import { Component, Inject } from '@angular/core'; // Importa Inject
import { CommonModule } from '@angular/common';

// Importaciones de Material
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-delete-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './confirm-delete-modal.component.html',
  styleUrl: './confirm-delete-modal.component.scss'
})
export class ConfirmDeleteModalComponent {

  // Inyectamos MAT_DIALOG_DATA para recibir datos
  // Inyectamos MatDialogRef para poder cerrar el diálogo
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, message: string }
  ) { }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }
}
