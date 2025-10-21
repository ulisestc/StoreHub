import { Component } from '@angular/core';

import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  // Definición del FormGroup para el formulario
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  // Método que se llamará al enviar el formulario
  onSubmit() {
    if (this.loginForm.valid) {
      // Por ahora, solo mostramos los datos en la consola
      // Aquí es donde después se llamará a auth.service
      console.log('Formulario válido:', this.loginForm.value);
    } else {
      console.log('Formulario inválido');
    }
  }
}
