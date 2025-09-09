import { BasePlugin, type BasePluginConfig } from "../../types/index.js";
import { SliderRenderer } from "./components/slider-renderer.js";
import { EventController } from "./events/event-controller.js";
import { StateManager } from "./state/state-manager.js";
import "./styles.js";
import {
  sliderButtonStyles,
  sliderHandleStyles,
  sliderImageStyles,
  sliderStyles,
} from "./styles.js";
import type {
  SliderConfig,
  SliderElements,
  SliderState,
} from "./types/slider-types.js";

// Ensure styles are included in the bundle
void sliderStyles;
void sliderHandleStyles;
void sliderButtonStyles;
void sliderImageStyles;

export class SliderPlugin extends BasePlugin {
  private elements: SliderElements | null = null;
  private renderer: SliderRenderer;
  private stateManager: StateManager;
  private eventController: EventController;
  private stateUnsubscribe: (() => void) | null = null;

  constructor(config: BasePluginConfig) {
    super(config);
    this.renderer = new SliderRenderer();
    this.stateManager = new StateManager();
    this.eventController = new EventController(this.stateManager);
  }

  render(): void {
    // Create the slider layout
    const sliderConfig: SliderConfig = {
      images: {
        before: this.beforeImage.src,
        after: this.afterImage.src,
      },
      initialPosition: 50,
      buttonIcon: "⟷",
    };

    this.elements = this.renderer.create(sliderConfig);
    this.container.appendChild(this.elements.container);

    // Attach event listeners
    this.eventController.attachEvents(this.elements);

    // Set up state change listeners
    this.setupStateListeners();
  }

  // Public API methods for dynamic updates
  updateImages(beforeSrc: string, afterSrc: string): void {
    this.renderer.updateImages(beforeSrc, afterSrc);
  }

  setPosition(percentage: number): void {
    this.stateManager.setPosition(percentage);
  }

  getPosition(): number {
    return this.stateManager.getState().position;
  }

  getElements(): SliderElements | null {
    return this.elements;
  }

  getState(): SliderState {
    return this.stateManager.getState();
  }

  destroy(): void {
    // Clean up event listeners
    this.eventController.destroy();

    // Unsubscribe from state changes
    if (this.stateUnsubscribe) {
      this.stateUnsubscribe();
    }

    // Clean up components
    this.renderer.destroy();
    this.stateManager.destroy();

    this.elements = null;
  }

  private setupStateListeners(): void {
    this.stateUnsubscribe = this.stateManager.onStateChange(
      (state: SliderState) => {
        // Update renderer based on state changes
        this.renderer.updatePosition(state.position);
        this.renderer.updateButtonVerticalPosition(
          state.buttonVerticalPosition,
        );
        this.renderer.setDraggingState(state.isDragging);
      },
    );
  }
}

// Re-export types for external use;
