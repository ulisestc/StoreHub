import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; //  Utilizamos el modulo common para fechas y directivas, esto hace que se actualicen solas
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  // Aqui ocupamos la fecha actual para el footer
  currentYear: number = new Date().getFullYear();
}