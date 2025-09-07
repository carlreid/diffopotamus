import { BasePlugin } from "../../types/index.js";
import { SideBySideRenderer } from "./components/side-by-side-renderer.js";
import { StyleManager } from "./styles/style-manager.js";
import type {
  SideBySideConfig,
  SideBySideElements,
} from "./types/side-by-side-types.js";

export class SideBySidePlugin extends BasePlugin {
  private elements: SideBySideElements | null = null;
  private styleManager: StyleManager;
  private renderer: SideBySideRenderer;
  private showLabels: boolean = true;
  private sideBySideConfig: SideBySideConfig | undefined = undefined;

  constructor(config: SideBySideConfig) {
    super(config);
    this.styleManager = StyleManager.getInstance();
    this.renderer = new SideBySideRenderer();
    this.sideBySideConfig = config;
  }

  render(): void {
    if (!this.sideBySideConfig) {
      throw new Error("Config is not defined");
    }

    this.styleManager.injectStyles();
    this.elements = this.renderer.create(this.sideBySideConfig);
    this.container.appendChild(this.elements.container);
  }

  // Public API methods for dynamic updates
  updateImages(beforeSrc: string, afterSrc: string): void {
    this.renderer.updateImages(beforeSrc, afterSrc);
  }

  updateLabels(beforeText: string, afterText: string): void {
    this.renderer.updateLabels(beforeText, afterText);
  }

  setOrientation(orientation: "horizontal" | "vertical"): void {
    this.renderer.setOrientation(orientation);
  }

  setGap(gap: string): void {
    this.renderer.setGap(gap);
  }

  setShowLabels(showLabels: boolean): void {
    this.showLabels = showLabels;
    this.renderer.setShowLabels(showLabels);
  }

  getShowLabels(): boolean {
    return this.showLabels;
  }

  toggleLabels(): boolean {
    this.setShowLabels(!this.showLabels);
    return this.showLabels;
  }

  getElements(): SideBySideElements | null {
    return this.elements;
  }

  destroy(): void {
    this.renderer.destroy();
    this.elements = null;
  }
}

// Re-export types for external use
export type {
  SideBySideConfig,
  SideBySideElements,
} from "./types/side-by-side-types.js";
