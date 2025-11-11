import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, inject, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';

// FIX: Replaced @HostListener decorators with the 'host' property for better adherence to Angular best practices.
@Component({
  selector: 'app-kaleidoscope-cursor',
  template: '', // No template needed, we manipulate the DOM directly
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  host: {
    '(document:mousemove)': 'onMouseMove($event)',
    '(document:mouseleave)': 'onMouseLeave()',
  }
})
export class KaleidoscopeCursorComponent implements OnInit, OnDestroy {
  private renderer = inject(Renderer2);

  private dots: HTMLElement[] = [];
  private readonly colors = [
    'rgba(255, 0, 255, 0.8)', 'rgba(0, 255, 255, 0.8)', 'rgba(255, 255, 0, 0.8)',
    'rgba(255, 0, 0, 0.8)', 'rgba(0, 255, 0, 0.8)', 'rgba(0, 0, 255, 0.8)'
  ];
  private coords = { x: 0, y: 0 };

  ngOnInit(): void {
    if (typeof document !== 'undefined') {
      for (let i = 0; i < this.colors.length * 2; i++) {
        const dot = this.renderer.createElement('div');
        this.renderer.setStyle(dot, 'position', 'fixed');
        this.renderer.setStyle(dot, 'width', '15px');
        this.renderer.setStyle(dot, 'height', '15px');
        this.renderer.setStyle(dot, 'borderRadius', '50%');
        this.renderer.setStyle(dot, 'pointerEvents', 'none');
        this.renderer.setStyle(dot, 'zIndex', '9999');
        this.renderer.setStyle(dot, 'mixBlendMode', 'screen');
        this.renderer.setStyle(dot, 'backgroundColor', this.colors[i % this.colors.length]);
        this.renderer.setStyle(dot, 'transform', `translate(-50%, -50%) scale(0)`);
        this.renderer.setStyle(dot, 'transition', `transform ${0.1 + i * 0.02}s ease-out`);
        this.renderer.appendChild(document.body, dot);
        this.dots.push(dot);
      }
    }
  }

  onMouseMove(event: MouseEvent): void {
    this.coords.x = event.clientX;
    this.coords.y = event.clientY;

    this.dots.forEach((dot) => {
      this.renderer.setStyle(dot, 'left', `${this.coords.x}px`);
      this.renderer.setStyle(dot, 'top', `${this.coords.y}px`);
      this.renderer.setStyle(dot, 'transform', 'translate(-50%, -50%) scale(1)');
    });

    this.renderer.setStyle(document.body, 'cursor', 'none');
  }

  onMouseLeave(): void {
    this.dots.forEach(dot => {
      this.renderer.setStyle(dot, 'transform', 'translate(-50%, -50%) scale(0)');
    });
    this.renderer.setStyle(document.body, 'cursor', 'auto');
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      this.dots.forEach(dot => this.renderer.removeChild(document.body, dot));
      this.renderer.setStyle(document.body, 'cursor', 'auto');
    }
  }
}
