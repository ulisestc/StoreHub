import { Component, OnInit, OnDestroy, inject, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TourService } from '../../services/tour.service';

export interface TourStep {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  badge: string;
  highlightText: string;
  targetSelector: string;
}

export interface SpotlightRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CardPosition {
  top: number;
  left: number;
}

@Component({
  selector: 'app-onboarding-tour',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './onboarding-tour.component.html',
  styleUrls: ['./onboarding-tour.component.scss']
})
export class OnboardingTourComponent implements OnInit, OnDestroy {
  private tourService = inject(TourService);
  private elRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);

  currentStep = 0;
  spotlightRect: SpotlightRect | null = null;
  cardPosition: CardPosition = { top: 100, left: 100 };

  steps: TourStep[] = [
    {
      title: 'Bienvenido a StoreHub',
      subtitle: 'El control de tu negocio en un solo lugar',
      description: 'Desde esta pantalla principal puedes ver cuánto llevas vendido hoy, revisar si algún producto se está terminando y entrar rápido a las herramientas que usas todos los días.',
      icon: 'store',
      badge: 'Inicio',
      highlightText: 'Puedes volver a ver esta guía cuando quieras desde el botón Recorrido Guiado.',
      targetSelector: '[data-tour="dashboard-header"]'
    },
    {
      title: 'Punto de Venta',
      subtitle: 'Cobra rápido y sin complicaciones',
      description: 'Aquí registras tus ventas del día. Busca productos por nombre o escanea su código de barras, elige si te pagan en efectivo o con tarjeta y el sistema calcula el cambio por ti.',
      icon: 'point_of_sale',
      badge: 'Ventas',
      highlightText: 'Al terminar la venta puedes imprimir el ticket o enviarlo por WhatsApp o correo.',
      targetSelector: '[data-tour="pos-button"], [data-tour="sidebar-pos"]'
    },
    {
      title: 'Tus Productos e Inventario',
      subtitle: 'Siempre al tanto de tu mercancía',
      description: 'Da de alta lo que vendes, actualiza precios y revisa cuántas piezas te quedan. StoreHub te avisa cuando queda poca existencia para que hagas tus pedidos a tiempo.',
      icon: 'inventory_2',
      badge: 'Inventario',
      highlightText: 'Registra cuánto te cuesta cada producto y a cuánto lo vendes para conocer tu ganancia.',
      targetSelector: '[data-tour="products"], [data-tour="sidebar-products"]'
    },
    {
      title: 'Corte de Caja',
      subtitle: 'Cuentas claras al terminar el turno',
      description: 'Al empezar el día anotas con cuánto dinero abres la caja. Al cerrar, el sistema te dice exactamente cuánto efectivo debe haber, separando los cobros con tarjeta.',
      icon: 'lock_clock',
      badge: 'Caja',
      highlightText: 'Así sabes al instante si las cuentas cuadran o si sobró o faltó dinero.',
      targetSelector: '[data-tour="corte"], [data-tour="sidebar-corte"]'
    },
    {
      title: 'Gastos del Negocio',
      subtitle: 'Conoce tu ganancia libre real',
      description: 'Anota los pagos que salen de tu tienda como luz, renta, internet, sueldos o envíos. Así llevas el control claro de a dónde se va el dinero cada mes.',
      icon: 'receipt_long',
      badge: 'Gastos',
      highlightText: 'El sistema resta estos gastos de tus ventas para mostrarte cuánto ganaste libre.',
      targetSelector: '[data-tour="expenses"], [data-tour="sidebar-expenses"]'
    },
    {
      title: 'Reportes de tu Tienda',
      subtitle: 'Descubre qué es lo que más se vende',
      description: 'Consulta de forma sencilla tus ventas por mes, cuáles son tus productos estrella y qué artículos suelen comprarse juntos para surtir mejor tu negocio.',
      icon: 'insights',
      badge: 'Reportes',
      highlightText: 'Incluso si se va el internet, puedes seguir cobrando y tus ventas se guardan solas.',
      targetSelector: '[data-tour="analytics"], [data-tour="sidebar-analytics"]'
    }
  ];

  get currentStepData(): TourStep {
    return this.steps[this.currentStep];
  }

  get progress(): number {
    return ((this.currentStep + 1) / this.steps.length) * 100;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.updateSpotlight();
    }, 80);
  }

  ngOnDestroy(): void {}

  @HostListener('window:resize')
  onResize(): void {
    this.updateSpotlight();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.updateSpotlight();
  }

  private findTargetElement(selectorList: string): HTMLElement | null {
    const selectors = selectorList.split(',').map(s => s.trim()).filter(Boolean);
    for (const sel of selectors) {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          return el;
        }
      }
    }
    return null;
  }

  updateSpotlight(): void {
    this.cdr.detectChanges();
    const step = this.currentStepData;
    const targetEl = this.findTargetElement(step.targetSelector);

    if (!targetEl) {
      this.spotlightRect = null;
      this.cardPosition = this.getCenteredPosition();
      return;
    }

    targetEl.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'nearest', inline: 'nearest' });

    setTimeout(() => {
      this.cdr.detectChanges();
      const wrapper = this.elRef.nativeElement.querySelector('.tour-screen-wrapper') as HTMLElement;
      const cardEl = this.elRef.nativeElement.querySelector('.tour-popover-card') as HTMLElement;
      const wRect = wrapper ? wrapper.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
      const ratio = (wrapper && wrapper.clientWidth && wRect.width) ? (wRect.width / wrapper.clientWidth) : 1;
      const winW = (wrapper && wrapper.clientWidth) ? wrapper.clientWidth : window.innerWidth;
      const winH = (wrapper && wrapper.clientHeight) ? wrapper.clientHeight : window.innerHeight;

      const cardRect = cardEl ? cardEl.getBoundingClientRect() : null;
      const cardW = cardRect && cardRect.width > 0 ? (cardRect.width / ratio) : 440;
      const cardH = cardRect && cardRect.height > 0 ? (cardRect.height / ratio) : 320;

      const rect = targetEl.getBoundingClientRect();
      const pad = 8;
      this.spotlightRect = {
        x: Math.max(4, ((rect.left - wRect.left) / ratio) - pad),
        y: Math.max(4, ((rect.top - wRect.top) / ratio) - pad),
        w: (rect.width / ratio) + (pad * 2),
        h: (rect.height / ratio) + (pad * 2)
      };

      this.cardPosition = this.calculateCardPosition(this.spotlightRect, winW, winH, cardW, cardH);
    }, 30);
  }

  private overlaps(left: number, top: number, w: number, h: number, s: SpotlightRect, margin = 10): boolean {
    return !(
      left + w + margin <= s.x ||
      left >= s.x + s.w + margin ||
      top + h + margin <= s.y ||
      top >= s.y + s.h + margin
    );
  }

  private calculateCardPosition(
    spotlight: SpotlightRect,
    winW: number,
    winH: number,
    cardWidth: number,
    cardHeight: number
  ): CardPosition {
    const padding = 16;
    const gap = 18;

    const spaceBelow = winH - (spotlight.y + spotlight.h);
    const spaceAbove = spotlight.y;
    const spaceRight = winW - (spotlight.x + spotlight.w);
    const spaceLeft = spotlight.x;

    const clampX = (x: number) => Math.max(padding, Math.min(x, winW - cardWidth - padding));
    const clampY = (y: number) => Math.max(padding, Math.min(y, winH - cardHeight - padding));

    // 1. Narrow target on the left (e.g. sidebar or button) -> place to the right
    if (spotlight.w < 380 && spaceRight >= cardWidth + gap + padding) {
      const left = spotlight.x + spotlight.w + gap;
      const top = clampY(spotlight.y + (spotlight.h / 2) - (cardHeight / 2));
      if (!this.overlaps(left, top, cardWidth, cardHeight, spotlight)) {
        return { top, left };
      }
    }

    // 2. Below the spotlight
    if (spaceBelow >= cardHeight + gap + padding) {
      const top = spotlight.y + spotlight.h + gap;
      const left = clampX(spotlight.x + (spotlight.w / 2) - (cardWidth / 2));
      if (!this.overlaps(left, top, cardWidth, cardHeight, spotlight)) {
        return { top, left };
      }
    }

    // 3. Above the spotlight
    if (spaceAbove >= cardHeight + gap + padding) {
      const top = spotlight.y - cardHeight - gap;
      const left = clampX(spotlight.x + (spotlight.w / 2) - (cardWidth / 2));
      if (!this.overlaps(left, top, cardWidth, cardHeight, spotlight)) {
        return { top, left };
      }
    }

    // 4. Right of spotlight (for wider targets)
    if (spaceRight >= cardWidth + gap + padding) {
      const left = spotlight.x + spotlight.w + gap;
      const top = clampY(spotlight.y + (spotlight.h / 2) - (cardHeight / 2));
      if (!this.overlaps(left, top, cardWidth, cardHeight, spotlight)) {
        return { top, left };
      }
    }

    // 5. Left of spotlight
    if (spaceLeft >= cardWidth + gap + padding) {
      const left = spotlight.x - cardWidth - gap;
      const top = clampY(spotlight.y + (spotlight.h / 2) - (cardHeight / 2));
      if (!this.overlaps(left, top, cardWidth, cardHeight, spotlight)) {
        return { top, left };
      }
    }

    // 6. Fallback for very small screens: place strictly outside spotlight on the side with more vertical space
    const centeredLeft = clampX(spotlight.x + (spotlight.w / 2) - (cardWidth / 2));
    if (spaceBelow >= spaceAbove) {
      return {
        top: spotlight.y + spotlight.h + 14,
        left: centeredLeft
      };
    } else {
      return {
        top: spotlight.y - cardHeight - 14,
        left: centeredLeft
      };
    }
  }

  private getCenteredPosition(): CardPosition {
    const wrapper = this.elRef.nativeElement.querySelector('.tour-screen-wrapper') as HTMLElement;
    const cardWidth = 480;
    const cardHeight = 340;
    const winW = (wrapper && wrapper.clientWidth) ? wrapper.clientWidth : window.innerWidth;
    const winH = (wrapper && wrapper.clientHeight) ? wrapper.clientHeight : window.innerHeight;

    return {
      top: Math.max(20, (winH - cardHeight) / 2),
      left: Math.max(20, (winW - cardWidth) / 2)
    };
  }

  next(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.updateSpotlight();
    } else {
      this.finish();
    }
  }

  prev(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateSpotlight();
    }
  }

  finish(): void {
    this.tourService.endTour();
  }

  skip(): void {
    this.tourService.endTour();
  }
}
