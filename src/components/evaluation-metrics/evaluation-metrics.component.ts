import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongEvaluationMetrics } from '../../services/plugins/model-plugin.interface';

@Component({
  selector: 'app-evaluation-metrics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evaluation-metrics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvaluationMetricsComponent {
  metrics = input.required<SongEvaluationMetrics>();
  isLoading = input<boolean>(false);

  overallScoreColor = computed(() => {
    const score = this.metrics().overallScore;
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  });

  getScoreColor(score: number): string {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  }

  getScoreBarWidth(score: number): string {
    return `${score}%`;
  }

  getLyricalAverage = computed(() => {
    const lyrical = this.metrics().lyrical;
    return Math.round(
      (lyrical.rhymeConsistency +
        lyrical.emotionalCoherence +
        lyrical.originality +
        lyrical.clarity) /
        4
    );
  });

  getMusicalAverage = computed(() => {
    const musical = this.metrics().musical;
    return Math.round(
      (musical.melodicInterest +
        musical.harmonicQuality +
        musical.rhythmicConsistency +
        musical.structureQuality) /
        4
    );
  });
}
