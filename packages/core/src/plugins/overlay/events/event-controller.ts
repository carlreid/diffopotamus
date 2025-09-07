import type { StateManager } from "../state/state-manager.js";
import type {
  ButtonElements,
  ControlElements,
  SelectorElements,
  SliderElements,
} from "../types/overlay-types.js";

export class EventController {
  private stateManager: StateManager;
  private cleanup: Array<() => void> = [];

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  attachEvents(
    buttons: ButtonElements,
    sliders: SliderElements,
    selectors: SelectorElements,
    controls: ControlElements,
  ): void {
    this.attachOpacitySliderEvents(sliders);
    this.attachPlayButtonEvents(buttons);
    this.attachToggleButtonEvents(buttons);
    this.attachExpandButtonEvents(buttons);
    this.attachSpeedSliderEvents(sliders);
    this.attachCurveSelectorEvents(selectors);
    this.attachOutsideClickHandler(controls);
  }

  private attachOpacitySliderEvents(sliders: SliderElements): void {
    const handleOpacityChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const value = parseInt(target.value, 10);
      this.stateManager.setOpacity(value);
    };

    sliders.opacity.addEventListener("input", handleOpacityChange);
    this.cleanup.push(() =>
      sliders.opacity.removeEventListener("input", handleOpacityChange),
    );
  }

  private attachPlayButtonEvents(buttons: ButtonElements): void {
    const handlePlayClick = () => {
      this.stateManager.togglePlayState();
    };

    buttons.play.addEventListener("click", handlePlayClick);
    this.cleanup.push(() =>
      buttons.play.removeEventListener("click", handlePlayClick),
    );
  }

  private attachToggleButtonEvents(buttons: ButtonElements): void {
    const handleBeforeClick = () => {
      this.stateManager.setOpacity(0);
    };

    const handleAfterClick = () => {
      this.stateManager.setOpacity(100);
    };

    buttons.before.addEventListener("click", handleBeforeClick);
    buttons.after.addEventListener("click", handleAfterClick);

    this.cleanup.push(() => {
      buttons.before.removeEventListener("click", handleBeforeClick);
      buttons.after.removeEventListener("click", handleAfterClick);
    });
  }

  private attachExpandButtonEvents(buttons: ButtonElements): void {
    const handleExpandClick = () => {
      this.stateManager.toggleExpandState();
    };

    buttons.expand.addEventListener("click", handleExpandClick);
    this.cleanup.push(() =>
      buttons.expand.removeEventListener("click", handleExpandClick),
    );
  }

  private attachSpeedSliderEvents(sliders: SliderElements): void {
    const handleSpeedChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const value = parseFloat(target.value);
      this.stateManager.setSpeed(value);
    };

    sliders.speed.addEventListener("input", handleSpeedChange);
    this.cleanup.push(() =>
      sliders.speed.removeEventListener("input", handleSpeedChange),
    );
  }

  private attachCurveSelectorEvents(selectors: SelectorElements): void {
    const handleCurveChange = (event: Event) => {
      const target = event.target as HTMLSelectElement;
      this.stateManager.setCurve(target.value);
    };

    selectors.curve.addEventListener("change", handleCurveChange);
    this.cleanup.push(() =>
      selectors.curve.removeEventListener("change", handleCurveChange),
    );
  }

  private attachOutsideClickHandler(controls: ControlElements): void {
    const handleOutsideClick = (event: Event) => {
      const target = event.target as Node;
      if (!controls.container.contains(target)) {
        const state = this.stateManager.getState();
        if (state.isExpanded) {
          this.stateManager.setExpandState(false);
        }
      }
    };

    document.addEventListener("click", handleOutsideClick);
    this.cleanup.push(() =>
      document.removeEventListener("click", handleOutsideClick),
    );
  }

  destroy(): void {
    for (const cleanupFn of this.cleanup) {
      cleanupFn();
    }
    this.cleanup.length = 0;
  }
}
