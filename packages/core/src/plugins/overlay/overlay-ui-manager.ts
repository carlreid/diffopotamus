import type { AnimationCurve } from "./animation-manager.js";
import { ControlsRenderer } from "./components/controls-renderer.js";
import { createContainer } from "./components/element-factory.js";
import { ImageRenderer } from "./components/image-renderer.js";
import { EventController } from "./events/event-controller.js";
import { StateManager } from "./state/state-manager.js";
import type { OverlayElements, UIState } from "./types/overlay-types.js";

export class OverlayUIManager {
  private elements: OverlayElements | null = null;
  private imageRenderer: ImageRenderer;
  private controlsRenderer: ControlsRenderer;
  private stateManager: StateManager;
  private eventController: EventController;
  private stateUnsubscribe: (() => void) | null = null;

  constructor() {
    this.imageRenderer = new ImageRenderer();
    this.controlsRenderer = new ControlsRenderer();
    this.stateManager = new StateManager();
    this.eventController = new EventController(this.stateManager);
  }

  create(
    parentContainer: HTMLElement,
    beforeImageSrc: string,
    afterImageSrc: string,
    animationCurves: AnimationCurve[],
  ): OverlayElements {
    // Create main plugin container
    const container = createContainer(
      "diffopotamus-plugin diffopotamus-overlay",
    );

    // Create image components
    const imageElements = this.imageRenderer.create(
      beforeImageSrc,
      afterImageSrc,
    );

    // Create control components
    const { controls, sliders, buttons, selectors } =
      this.controlsRenderer.create(animationCurves);

    // Assemble main structure
    container.appendChild(imageElements.container);
    container.appendChild(controls.container);
    parentContainer.appendChild(container);

    // Store elements reference for compatibility
    this.elements = {
      container,
      imageContainer: imageElements.container,
      beforeImg: imageElements.beforeImg,
      afterImg: imageElements.afterImg,
      controlsContainer: controls.container,
      compactControls: controls.compact,
      advancedControls: controls.advanced,
      opacitySlider: sliders.opacity,
      opacityValue: sliders.opacityValue,
      beforeButton: buttons.before,
      afterButton: buttons.after,
      playButton: buttons.play,
      expandButton: buttons.expand,
      curveSelector: selectors.curve,
      speedSlider: sliders.speed,
      speedValue: sliders.speedValue,
    };

    // Attach event listeners
    this.eventController.attachEvents(buttons, sliders, selectors, controls);

    // Set up state change listeners
    this.setupStateListeners();

    return this.elements;
  }

  updateOpacity(_opacity: number, value: number): void {
    this.stateManager.setOpacity(value);
  }

  updatePlayButton(isPlaying: boolean): void {
    this.stateManager.setPlayState(isPlaying);
  }

  updateSpeedDisplay(speed: number): void {
    this.stateManager.setSpeed(speed);
  }

  destroy(parentContainer: HTMLElement): void {
    // Clean up event listeners
    this.eventController.destroy();

    // Unsubscribe from state changes
    if (this.stateUnsubscribe) {
      this.stateUnsubscribe();
    }

    // Clean up components
    this.imageRenderer.destroy();
    this.controlsRenderer.destroy();
    this.stateManager.destroy();

    // Remove from DOM
    if (this.elements?.container.parentNode) {
      parentContainer.removeChild(this.elements.container);
    }

    this.elements = null;
  }

  get(): OverlayElements | null {
    return this.elements;
  }

  private setupStateListeners(): void {
    this.stateUnsubscribe = this.stateManager.onStateChange(
      (state: UIState) => {
        // Update image opacity
        this.imageRenderer.updateOpacity(state.opacity / 100);

        // Update controls display
        this.controlsRenderer.updateOpacityDisplay(state.opacity);
        this.controlsRenderer.updatePlayButton(state.isPlaying);
        this.controlsRenderer.updateSpeedDisplay(state.speed);
        this.controlsRenderer.toggleAdvancedControls(state.isExpanded);
      },
    );
  }
}
