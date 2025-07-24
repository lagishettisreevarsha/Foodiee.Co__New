import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ScrollService {
  private scrollY = 0;

  setScrollPosition(y: number) {
    this.scrollY = y;
  }

  getScrollPosition(): number {
    return this.scrollY;
  }
}
