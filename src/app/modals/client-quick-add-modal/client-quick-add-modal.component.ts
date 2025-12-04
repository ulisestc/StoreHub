import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-client-quick-add-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './client-quick-add-modal.component.html',
  styleUrl: './client-quick-add-modal.component.scss'
})
export class ClientQuickAddModalComponent implements OnInit {

  clientForm!: FormGroup;
  private clientService = inject(ClientService);

  constructor(
    public dialogRef: MatDialogRef<ClientQuickAddModalComponent>
  ) { }

  ngOnInit(): void {
    this.clientForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.email]),
      phone: new FormControl(''),
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.clientForm.valid) {
      this.clientService.createClient(this.clientForm.value).subscribe(newClient => {
        this.dialogRef.close(newClient);
      });
    }
  }
}
