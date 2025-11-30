import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SongGeneratorComponent } from './components/song-generator/song-generator.component';
import { MatrixRainComponent } from './components/matrix-rain/matrix-rain.component';
import { KaleidoscopeCursorComponent } from './components/kaleidoscope-cursor/kaleidoscope-cursor.component';
import { GridPatternComponent } from './components/grid-pattern/grid-pattern.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SongGeneratorComponent, MatrixRainComponent, KaleidoscopeCursorComponent, GridPatternComponent]
})
export class AppComponent {}