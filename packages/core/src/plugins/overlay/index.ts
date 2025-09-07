import { BasePlugin, type BasePluginConfig } from "../../types/index.js";
import { AnimationManager } from "./animation-manager.js";
import { OverlayEventManager } from "./overlay-event-manager.js";
import { OverlayUIManager } from "./overlay-ui-manager.js";

export class OverlayPlugin extends BasePlugin {
  private animationManager: AnimationManager;
  private uiManager: OverlayUIManager;
  private eventManager: OverlayEventManager;

  constructor(config: BasePluginConfig) {
    super(config);
    this.animationManager = new AnimationManager();
    this.uiManager = new OverlayUIManager();
    this.eventManager = new OverlayEventManager();
  }

  render(): void {
    this.createLayout();
    this.setupEventListeners();
  }

  private createLayout(): void {
    this.uiManager.create(
      this.container,
      this.beforeImage.src,
      this.afterImage.src,
      this.animationManager.curves,
    );
  }

  private setupEventListeners(): void {
    this.eventManager.setup(this.uiManager, this.animationManager);
  }

  destroy(): void {
    // Stop any running animation
    this.animationManager.stop();

    // Cleanup event listeners
    this.eventManager.cleanup();

    // Remove UI elements
    this.uiManager.destroy(this.container);
  }
}
