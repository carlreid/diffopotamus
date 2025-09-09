import type { AnimationCurve } from "../animation-manager.js";
import type {
  ButtonConfig,
  SelectOption,
  SelectorConfig,
  SliderConfig,
} from "../types/overlay-types.js";

export function createContainer(className: string): HTMLElement {
  const container = document.createElement("div");
  container.className = className;
  return container;
}

export function createImageElement(
  src: string,
  alt: string,
  type: "before" | "after",
): HTMLImageElement {
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  img.className = `diffopotamus-overlay-image diffopotamus-overlay-image--${type}`;
  img.draggable = false;
  return img;
}

function createSlider(config: SliderConfig): HTMLInputElement {
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = config.min;
  slider.max = config.max;
  slider.value = config.value;
  slider.className = config.className;
  slider.title = config.title;

  if (config.step) {
    slider.step = config.step;
  }

  return slider;
}

function createButton(config: ButtonConfig): HTMLButtonElement {
  const button = document.createElement("button");
  button.textContent = config.text;
  button.className = config.className;
  button.title = config.title;
  button.type = config.type || "button";
  return button;
}

function createSelector(config: SelectorConfig): HTMLSelectElement {
  const select = document.createElement("select");
  select.className = config.className;
  select.title = config.title;

  config.options.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.value = option.value;
    optionElement.textContent = option.text;
    select.appendChild(optionElement);
  });

  return select;
}

function createValueDisplay(
  className: string,
  initialValue: string,
): HTMLElement {
  const span = document.createElement("span");
  span.className = className;
  span.textContent = initialValue;
  return span;
}

export function createOpacityControls() {
  const slider = createSlider({
    type: "opacity",
    min: "0",
    max: "100",
    value: "50",
    className: "diffopotamus-opacity-slider",
    title: "Blend ratio",
  });

  const value = createValueDisplay("diffopotamus-opacity-value", "50%");

  return { slider, value };
}

export function createPlayButton(): HTMLButtonElement {
  return createButton({
    text: "▶",
    className: "diffopotamus-play-button",
    title: "Play/Pause automatic blending",
  });
}

export function createExpandButton(): HTMLButtonElement {
  const button = createButton({
    text: "⚙️",
    className: "diffopotamus-expand-button",
    title: "Show advanced controls",
  });
  button.innerHTML = "⚙️"; // Use innerHTML for emoji
  return button;
}

export function createToggleButtons() {
  const before = createButton({
    text: "◀",
    className: "diffopotamus-toggle-button diffopotamus-toggle-before",
    title: "Show before image",
  });
  before.innerHTML = "◀"; // Use innerHTML for arrow

  const after = createButton({
    text: "▶",
    className: "diffopotamus-toggle-button diffopotamus-toggle-after",
    title: "Show after image",
  });
  after.innerHTML = "▶"; // Use innerHTML for arrow

  return { before, after };
}

export function createAnimationControls(animationCurves: AnimationCurve[]) {
  const container = createContainer("diffopotamus-animation-controls");

  const curveOptions: SelectOption[] = animationCurves.map((curve) => ({
    value: curve.name,
    text: `${curve.icon} ${curve.name}`,
  }));

  const curveSelector = createSelector({
    options: curveOptions,
    className: "diffopotamus-curve-selector",
    title: "Animation curve",
  });

  const speedSlider = createSlider({
    type: "speed",
    min: "0.25",
    max: "3",
    step: "0.25",
    value: "1",
    className: "diffopotamus-speed-slider",
    title: "Animation speed",
  });

  const speedValue = createValueDisplay("diffopotamus-speed-value", "1x");

  container.appendChild(curveSelector);
  container.appendChild(speedSlider);
  container.appendChild(speedValue);

  return { container, curveSelector, speedSlider, speedValue };
}
