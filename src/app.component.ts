import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SongGeneratorComponent } from './components/song-generator/song-generator.component';
import { MatrixRainComponent } from './components/matrix-rain/matrix-rain.component';
import { KaleidoscopeCursorComponent } from './components/kaleidoscope-cursor/kaleidoscope-cursor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SongGeneratorComponent, MatrixRainComponent, KaleidoscopeCursorComponent]
})
export class AppComponent {}
