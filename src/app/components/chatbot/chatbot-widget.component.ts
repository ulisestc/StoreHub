import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';

import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Pipe({
  name: 'formatChat',
  standalone: true
})
export class FormatChatPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';
    try {
      // Configuramos marked para que respete saltos de línea (breaks) y sea asíncrono-safe
      marked.setOptions({
        breaks: true,
        gfm: true
      });
      const html = marked.parse(value) as string;
      return this.sanitizer.bypassSecurityTrustHtml(html);
    } catch (e) {
      return this.sanitizer.bypassSecurityTrustHtml(value);
    }
  }
}

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    FormatChatPipe
  ],
  templateUrl: './chatbot-widget.component.html',
  styleUrls: ['./chatbot-widget.component.scss']
})
export class ChatbotWidgetComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  analyticsService = inject(AnalyticsService);
  authService = inject(AuthService);

  isPremium = false;
  isOpen = false;
  isTyping = false;
  messageText = '';
  
  messages: ChatMessage[] = [
    { role: 'assistant', content: '¡Hola! Soy tu Asistente IA. Puedo ayudarte a analizar tus ventas, productos y rendimiento. ¿En qué te puedo ayudar hoy?', timestamp: new Date() }
  ];

  suggestions = [
    '¿Cuánto vendí hoy?',
    '¿Qué producto se vende más?',
    '¿Qué debo re-stockear?'
  ];

  ngOnInit() {
    this.isPremium = this.authService.isPremium();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  sendSuggestion(suggestion: string) {
    this.messageText = suggestion;
    this.sendMessage();
  }

  sendMessage() {
    if (!this.messageText.trim()) return;

    const userMessage = this.messageText;
    this.messages.push({ role: 'user', content: userMessage, timestamp: new Date() });
    this.messageText = '';
    this.isTyping = true;

    this.analyticsService.sendChatMessage(userMessage).subscribe({
      next: (res) => {
        this.isTyping = false;
        this.messages.push({ role: 'assistant', content: res.reply, timestamp: new Date() });
      },
      error: (err) => {
        this.isTyping = false;
        let errorMsg = 'Lo siento, ha ocurrido un error de conexión.';
        if (err.status === 500 || err.error?.error?.includes('DEEPSEEK_API_KEY')) {
           errorMsg = 'El asistente IA no está disponible. Configura tu API key de DeepSeek en el servidor.';
        }
        this.messages.push({ role: 'assistant', content: errorMsg, timestamp: new Date() });
      }
    });
  }

  scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }
}
