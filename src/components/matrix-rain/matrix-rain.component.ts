import { Component, ChangeDetectionStrategy, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-matrix-rain',
  template: `<canvas #matrixCanvas class="fixed top-0 left-0 w-full h-full -z-20 opacity-30"></canvas>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class MatrixRainComponent implements AfterViewInit, OnDestroy {
  @ViewChild('matrixCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D | null;
  private animationInterval: number | undefined;
  private resizeListener!: () => void;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;

    const setupAndDraw = () => {
      if (!this.ctx) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
      const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const nums = '0123456789';
      const alphabet = katakana + latin + nums;

      const fontSize = 16;
      const columns = Math.floor(canvas.width / fontSize);
      const rainDrops: number[] = [];

      for (let x = 0; x < columns; x++) {
        rainDrops[x] = 1;
      }

      const draw = () => {
        if (!this.ctx) return;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.ctx.fillStyle = '#0F0'; // Green text
        this.ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < rainDrops.length; i++) {
          const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
          this.ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

          if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            rainDrops[i] = 0;
          }
          rainDrops[i]++;
        }
      };
      
      if (this.animationInterval) {
        clearInterval(this.animationInterval);
      }
      this.animationInterval = window.setInterval(draw, 33);
    };
    
    this.resizeListener = () => setupAndDraw();
    window.addEventListener('resize', this.resizeListener);
    setupAndDraw();
  }

  ngOnDestroy(): void {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }
}
