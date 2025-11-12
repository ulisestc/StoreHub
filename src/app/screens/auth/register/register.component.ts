import { Component } from '@angular/core';

import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-register',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  // Definición del FormGroup para el registro
  // Los campos requeridos son nombre, apellidos, correo y contraseña
  registerForm = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    apellidos: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  // Método que se llamará al enviar
  onSubmit() {
    if (this.registerForm.valid) {
      console.log('Datos de registro:', this.registerForm.value);
      // Aquí llamaremos al auth.service.register() en el futuro
    } else {
      console.log('Formulario de registro inválido');
    }
  }
}
