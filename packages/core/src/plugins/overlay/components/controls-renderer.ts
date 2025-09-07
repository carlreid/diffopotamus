import type { AnimationCurve } from "../animation-manager.js";
import type {
  ButtonElements,
  ControlElements,
  SelectorElements,
  SliderElements,
} from "../types/overlay-types.js";
import {
  createAnimationControls,
  createContainer,
  createExpandButton,
  createOpacityControls,
  createPlayButton,
  createToggleButtons,
} from "./element-factory.js";

export class ControlsRenderer {
  private elements: ControlElements | null = null;
  private sliders: SliderElements | null = null;
  private buttons: ButtonElements | null = null;
  private selectors: SelectorElements | null = null;

  create(animationCurves: AnimationCurve[]): {
    controls: ControlElements;
    sliders: SliderElements;
    buttons: ButtonElements;
    selectors: SelectorElements;
  } {
    const container = createContainer("diffopotamus-overlay-controls");
    const compact = createContainer("diffopotamus-compact-controls");
    const advanced = createContainer("diffopotamus-advanced-controls");

    // Create individual controls
    const opacityControls = createOpacityControls();
    const playButton = createPlayButton();
    const expandButton = createExpandButton();
    const toggleButtons = createToggleButtons();
    const animationControls = createAnimationControls(animationCurves);

    // Assemble compact controls (always visible)
    compact.appendChild(opacityControls.slider);
    compact.appendChild(opacityControls.value);
    compact.appendChild(playButton);
    compact.appendChild(expandButton);

    // Assemble advanced controls (hidden by default)
    advanced.appendChild(toggleButtons.before);
    advanced.appendChild(toggleButtons.after);
    advanced.appendChild(animationControls.container);

    // Initially hide advanced controls
    advanced.style.display = "none";

    // Assemble main structure
    container.appendChild(compact);
    container.appendChild(advanced);

    this.elements = { container, compact, advanced };

    this.sliders = {
      opacity: opacityControls.slider,
      speed: animationControls.speedSlider,
      opacityValue: opacityControls.value,
      speedValue: animationControls.speedValue,
    };

    this.buttons = {
      play: playButton,
      expand: expandButton,
      before: toggleButtons.before,
      after: toggleButtons.after,
    };

    this.selectors = {
      curve: animationControls.curveSelector,
    };

    return {
      controls: this.elements,
      sliders: this.sliders,
      buttons: this.buttons,
      selectors: this.selectors,
    };
  }

  updateOpacityDisplay(value: number): void {
    if (!this.sliders) return;
    this.sliders.opacity.value = value.toString();
    this.sliders.opacityValue.textContent = `${value}%`;
  }

  updatePlayButton(isPlaying: boolean): void {
    if (!this.buttons) return;

    const button = this.buttons.play;
    if (isPlaying) {
      button.textContent = "⏸";
      button.classList.add("diffopotamus-play-button--playing");
    } else {
      button.textContent = "▶";
      button.classList.remove("diffopotamus-play-button--playing");
    }
  }

  updateSpeedDisplay(speed: number): void {
    if (!this.sliders) return;
    this.sliders.speedValue.textContent = `${speed}x`;
  }

  toggleAdvancedControls(isExpanded: boolean): void {
    if (!this.elements || !this.buttons) return;

    const { advanced, container } = this.elements;
    const { expand } = this.buttons;

    if (isExpanded) {
      advanced.style.display = "flex";
      expand.innerHTML = "✕";
      expand.title = "Hide advanced controls";
      container.classList.add("diffopotamus-expanded");
    } else {
      advanced.style.display = "none";
      expand.innerHTML = "⚙️";
      expand.title = "Show advanced controls";
      container.classList.remove("diffopotamus-expanded");
    }
  }

  getElements(): {
    controls: ControlElements | null;
    sliders: SliderElements | null;
    buttons: ButtonElements | null;
    selectors: SelectorElements | null;
  } {
    return {
      controls: this.elements,
      sliders: this.sliders,
      buttons: this.buttons,
      selectors: this.selectors,
    };
  }

  destroy(): void {
    if (this.elements?.container.parentNode) {
      this.elements.container.parentNode.removeChild(this.elements.container);
    }
    this.elements = null;
    this.sliders = null;
    this.buttons = null;
    this.selectors = null;
  }
}
