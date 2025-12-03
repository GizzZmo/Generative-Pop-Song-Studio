import { Injectable, signal, computed } from '@angular/core';
import {
  ModelPlugin,
  ModelPluginConfig,
  PluginType,
  LyricsModelPlugin,
  MidiModelPlugin,
  ImageModelPlugin,
  AnalysisModelPlugin,
  EvaluationModelPlugin,
} from './model-plugin.interface';

/**
 * Registered plugin entry with its metadata
 */
export interface RegisteredPlugin {
  type: PluginType;
  plugin: ModelPlugin;
  isActive: boolean;
  registeredAt: Date;
}

/**
 * Model Registry Service
 *
 * Manages the registration, activation, and lifecycle of model plugins.
 * Provides a central point for discovering and using different AI model backends.
 */
@Injectable({
  providedIn: 'root',
})
export class ModelRegistryService {
  private readonly plugins = signal<Map<string, RegisteredPlugin>>(new Map());

  /**
   * List of all registered plugins
   */
  readonly registeredPlugins = computed(() => Array.from(this.plugins().values()));

  /**
   * Get plugins by type
   */
  getPluginsByType(type: PluginType): RegisteredPlugin[] {
    return this.registeredPlugins().filter((p) => p.type === type);
  }

  /**
   * Get the currently active plugin for a given type
   */
  getActivePlugin<T extends ModelPlugin>(type: PluginType): T | null {
    const activePlugin = this.registeredPlugins().find(
      (p) => p.type === type && p.isActive
    );
    return activePlugin ? (activePlugin.plugin as T) : null;
  }

  /**
   * Get active lyrics plugin
   */
  getActiveLyricsPlugin(): LyricsModelPlugin | null {
    return this.getActivePlugin<LyricsModelPlugin>(PluginType.LYRICS);
  }

  /**
   * Get active MIDI plugin
   */
  getActiveMidiPlugin(): MidiModelPlugin | null {
    return this.getActivePlugin<MidiModelPlugin>(PluginType.MIDI);
  }

  /**
   * Get active image plugin
   */
  getActiveImagePlugin(): ImageModelPlugin | null {
    return this.getActivePlugin<ImageModelPlugin>(PluginType.IMAGE);
  }

  /**
   * Get active analysis plugin
   */
  getActiveAnalysisPlugin(): AnalysisModelPlugin | null {
    return this.getActivePlugin<AnalysisModelPlugin>(PluginType.ANALYSIS);
  }

  /**
   * Get active evaluation plugin
   */
  getActiveEvaluationPlugin(): EvaluationModelPlugin | null {
    return this.getActivePlugin<EvaluationModelPlugin>(PluginType.EVALUATION);
  }

  /**
   * Register a new plugin
   * @param type The type of plugin being registered
   * @param plugin The plugin instance to register
   * @param activate Whether to activate this plugin immediately (default: false)
   */
  async registerPlugin(
    type: PluginType,
    plugin: ModelPlugin,
    activate = false
  ): Promise<void> {
    const pluginId = plugin.config.id;

    if (this.plugins().has(pluginId)) {
      throw new Error(`Plugin with ID "${pluginId}" is already registered`);
    }

    const entry: RegisteredPlugin = {
      type,
      plugin,
      isActive: false,
      registeredAt: new Date(),
    };

    this.plugins.update((map) => {
      const newMap = new Map(map);
      newMap.set(pluginId, entry);
      return newMap;
    });

    if (activate) {
      await this.activatePlugin(pluginId);
    }
  }

  /**
   * Activate a plugin by ID
   * Deactivates any other plugin of the same type
   */
  async activatePlugin(pluginId: string): Promise<void> {
    const entry = this.plugins().get(pluginId);
    if (!entry) {
      throw new Error(`Plugin "${pluginId}" not found`);
    }

    // Deactivate other plugins of the same type
    this.plugins.update((map) => {
      const newMap = new Map(map);
      newMap.forEach((p, id) => {
        if (p.type === entry.type && id !== pluginId) {
          newMap.set(id, { ...p, isActive: false });
        }
      });
      // Activate the requested plugin
      newMap.set(pluginId, { ...entry, isActive: true });
      return newMap;
    });
  }

  /**
   * Deactivate a plugin by ID
   */
  deactivatePlugin(pluginId: string): void {
    const entry = this.plugins().get(pluginId);
    if (!entry) {
      throw new Error(`Plugin "${pluginId}" not found`);
    }

    this.plugins.update((map) => {
      const newMap = new Map(map);
      newMap.set(pluginId, { ...entry, isActive: false });
      return newMap;
    });
  }

  /**
   * Unregister and dispose a plugin
   */
  unregisterPlugin(pluginId: string): void {
    const entry = this.plugins().get(pluginId);
    if (!entry) {
      return;
    }

    // Dispose the plugin
    entry.plugin.dispose();

    // Remove from registry
    this.plugins.update((map) => {
      const newMap = new Map(map);
      newMap.delete(pluginId);
      return newMap;
    });
  }

  /**
   * Get plugin configuration requirements
   */
  getPluginConfig(pluginId: string): ModelPluginConfig | null {
    const entry = this.plugins().get(pluginId);
    return entry ? entry.plugin.config : null;
  }

  /**
   * Check if a plugin is ready to use
   */
  isPluginReady(pluginId: string): boolean {
    const entry = this.plugins().get(pluginId);
    return entry ? entry.plugin.isReady() : false;
  }

  /**
   * Initialize a plugin with configuration
   */
  async initializePlugin(
    pluginId: string,
    config: Record<string, unknown>
  ): Promise<void> {
    const entry = this.plugins().get(pluginId);
    if (!entry) {
      throw new Error(`Plugin "${pluginId}" not found`);
    }

    await entry.plugin.initialize(config);
  }

  /**
   * Get summary of registered plugins
   */
  getSummary(): {
    total: number;
    byType: Record<PluginType, number>;
    active: Record<PluginType, string | null>;
  } {
    const plugins = this.registeredPlugins();
    const byType: Record<PluginType, number> = {
      [PluginType.LYRICS]: 0,
      [PluginType.MIDI]: 0,
      [PluginType.IMAGE]: 0,
      [PluginType.ANALYSIS]: 0,
      [PluginType.EVALUATION]: 0,
    };

    const active: Record<PluginType, string | null> = {
      [PluginType.LYRICS]: null,
      [PluginType.MIDI]: null,
      [PluginType.IMAGE]: null,
      [PluginType.ANALYSIS]: null,
      [PluginType.EVALUATION]: null,
    };

    plugins.forEach((p) => {
      byType[p.type]++;
      if (p.isActive) {
        active[p.type] = p.plugin.config.id;
      }
    });

    return {
      total: plugins.length,
      byType,
      active,
    };
  }
}
