import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-grid-pattern',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grid-pattern.component.html',
  styleUrls: ['./grid-pattern.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridPatternComponent {}
