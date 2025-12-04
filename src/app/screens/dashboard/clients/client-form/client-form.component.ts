import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ClientService } from '../../../../services/client.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.scss'
})
export class ClientFormComponent implements OnInit {

  pageTitle: string = 'Crear Nuevo Cliente';
  isEditMode = false;
  private currentClientId: string | null = null;

  clientForm!: FormGroup;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientService = inject(ClientService);

  ngOnInit(): void {
    this.clientForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.email]),
      phone: new FormControl(''),
    });

    this.route.paramMap.subscribe(params => {
      this.currentClientId = params.get('id');
      if (this.currentClientId) {
        this.isEditMode = true;
        this.pageTitle = 'Editar Cliente';

        this.clientService.getClientById(this.currentClientId).subscribe(client => {
          if (client) {
            this.clientForm.patchValue(client);
          }
        });
      }
    });
  }

  onSubmit(): void {
    if (this.clientForm.valid) {
      const clientData = this.clientForm.value;

      if (this.isEditMode && this.currentClientId) {
        this.clientService.updateClient(this.currentClientId, clientData)
          .subscribe(() => this.router.navigate(['/dashboard/clients']));

      } else {
        this.clientService.createClient(clientData)
          .subscribe(() => this.router.navigate(['/dashboard/clients']));
      }
    }
  }
}
