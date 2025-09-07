import type { AnimationManager } from "./animation-manager.js";
import type { OverlayUIManager } from "./overlay-ui-manager.js";

interface EventHandlers {
  handleOpacityChange: () => void;
  handleBeforeClick: () => void;
  handleAfterClick: () => void;
  handlePlayPause: () => void;
  handleCurveChange: () => void;
  handleSpeedChange: () => void;
  handleManualSlider: () => void;
  cleanup: () => void;
}

export class OverlayEventManager {
  private handlers: EventHandlers | null = null;

  setup(uiManager: OverlayUIManager, animationManager: AnimationManager): void {
    const elements = uiManager.get();
    if (!elements) return;

    // Create handler functions
    const handleOpacityChange = () => {
      const value = parseInt(elements.opacitySlider.value, 10);
      const opacity = value / 100;
      uiManager.updateOpacity(opacity, value);
    };

    const handleBeforeClick = () => {
      animationManager.stop();
      uiManager.updatePlayButton(false);
      uiManager.updateOpacity(0, 0);
      elements.opacitySlider.value = "0";
    };

    const handleAfterClick = () => {
      animationManager.stop();
      uiManager.updatePlayButton(false);
      uiManager.updateOpacity(1, 100);
      elements.opacitySlider.value = "100";
    };

    const handlePlayPause = () => {
      if (animationManager.isRunning) {
        animationManager.stop();
        uiManager.updatePlayButton(false);
      } else {
        animationManager.start((opacity, value) => {
          uiManager.updateOpacity(opacity, value);
        });
        uiManager.updatePlayButton(true);
      }
    };

    const handleCurveChange = () => {
      animationManager.setCurve(elements.curveSelector.value);
    };

    const handleSpeedChange = () => {
      const speed = parseFloat(elements.speedSlider.value);
      animationManager.speed = speed;
      uiManager.updateSpeedDisplay(speed);
    };

    const handleManualSlider = () => {
      animationManager.stop();
      uiManager.updatePlayButton(false);
      handleOpacityChange();
    };

    // Attach event listeners
    elements.opacitySlider.addEventListener("input", handleManualSlider);
    elements.beforeButton.addEventListener("click", handleBeforeClick);
    elements.afterButton.addEventListener("click", handleAfterClick);
    elements.playButton.addEventListener("click", handlePlayPause);
    elements.curveSelector.addEventListener("change", handleCurveChange);
    elements.speedSlider.addEventListener("input", handleSpeedChange);

    // Store handlers for cleanup
    const cleanup = () => {
      elements.opacitySlider.removeEventListener("input", handleManualSlider);
      elements.beforeButton.removeEventListener("click", handleBeforeClick);
      elements.afterButton.removeEventListener("click", handleAfterClick);
      elements.playButton.removeEventListener("click", handlePlayPause);
      elements.curveSelector.removeEventListener("change", handleCurveChange);
      elements.speedSlider.removeEventListener("input", handleSpeedChange);
    };

    this.handlers = {
      handleOpacityChange,
      handleBeforeClick,
      handleAfterClick,
      handlePlayPause,
      handleCurveChange,
      handleSpeedChange,
      handleManualSlider,
      cleanup,
    };
  }

  cleanup(): void {
    if (this.handlers) {
      this.handlers.cleanup();
      this.handlers = null;
    }
  }
}
