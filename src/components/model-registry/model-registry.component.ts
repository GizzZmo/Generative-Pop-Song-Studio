import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelRegistryService, RegisteredPlugin } from '../../services/plugins/model-registry.service';
import { PluginType } from '../../services/plugins/model-plugin.interface';

@Component({
  selector: 'app-model-registry',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './model-registry.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelRegistryComponent {
  private readonly registryService = inject(ModelRegistryService);

  isExpanded = signal(false);

  plugins = computed(() => this.registryService.registeredPlugins());
  summary = computed(() => this.registryService.getSummary());

  readonly pluginTypes = Object.values(PluginType);

  toggleExpanded(): void {
    this.isExpanded.update(v => !v);
  }

  getPluginsByType(type: PluginType): RegisteredPlugin[] {
    return this.registryService.getPluginsByType(type);
  }

  getPluginTypeName(type: PluginType): string {
    const names: Record<PluginType, string> = {
      [PluginType.LYRICS]: 'Lyrics Generation',
      [PluginType.MIDI]: 'MIDI Generation',
      [PluginType.IMAGE]: 'Image Generation',
      [PluginType.ANALYSIS]: 'Lyric Analysis',
      [PluginType.EVALUATION]: 'Song Evaluation',
    };
    return names[type] || type;
  }

  getPluginTypeIcon(type: PluginType): string {
    const icons: Record<PluginType, string> = {
      [PluginType.LYRICS]: '📝',
      [PluginType.MIDI]: '🎹',
      [PluginType.IMAGE]: '🎨',
      [PluginType.ANALYSIS]: '🔍',
      [PluginType.EVALUATION]: '📊',
    };
    return icons[type] || '🔌';
  }

  async activatePlugin(pluginId: string): Promise<void> {
    try {
      await this.registryService.activatePlugin(pluginId);
    } catch (error) {
      console.error('Failed to activate plugin:', error);
    }
  }

  deactivatePlugin(pluginId: string): void {
    this.registryService.deactivatePlugin(pluginId);
  }

  isPluginReady(pluginId: string): boolean {
    return this.registryService.isPluginReady(pluginId);
  }
}
