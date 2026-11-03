import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private router = inject(Router);
  private activeSubject = new BehaviorSubject<boolean>(false);
  isActive$ = this.activeSubject.asObservable();

  startTour(): void {
    if (this.router.url !== '/dashboard') {
      this.router.navigate(['/dashboard']).then(() => {
        setTimeout(() => this.activeSubject.next(true), 250);
      });
    } else {
      this.activeSubject.next(true);
    }
  }

  endTour(): void {
    localStorage.setItem('storehub_tour_completed', 'true');
    this.activeSubject.next(false);
  }

  checkAndStartAutoTour(): void {
    const completed = localStorage.getItem('storehub_tour_completed');
    if (!completed) {
      setTimeout(() => {
        this.startTour();
      }, 800);
    }
  }
}
