import {
  sliderButtonStyles,
  sliderHandleStyles,
  sliderImageStyles,
  sliderStyles,
} from "../styles.js";

function createContainer(className?: string): HTMLElement {
  const container = document.createElement("div");
  container.className = className || sliderStyles;
  return container;
}

function createImageElement(
  src: string,
  alt: string,
  type: "before" | "after",
): HTMLImageElement {
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  // Use both the Linaria class and the type-specific class
  img.className = `${sliderImageStyles} ${type}`;
  return img;
}

function createSliderHandle(): HTMLElement {
  const handle = document.createElement("div");
  handle.className = sliderHandleStyles;
  handle.style.left = "50%";
  return handle;
}

function createSliderButton(icon: string = "⟷"): HTMLElement {
  const button = document.createElement("div");
  button.className = sliderButtonStyles;
  button.innerHTML = icon;
  button.style.top = "50%";
  button.style.left = "50%";
  return button;
}

export function createSliderLayout(
  beforeImageSrc: string,
  afterImageSrc: string,
  config: {
    initialPosition?: number;
    buttonIcon?: string;
  } = {},
) {
  const { initialPosition = 50, buttonIcon = "⟷" } = config;

  // Create main container
  const container = createContainer();

  // Create images (order matters for z-index layering)
  const afterImage = createImageElement(afterImageSrc, "After image", "after");
  const beforeImage = createImageElement(
    beforeImageSrc,
    "Before image",
    "before",
  );

  // Create slider elements
  const sliderHandle = createSliderHandle();
  const sliderButton = createSliderButton(buttonIcon);

  // Set initial position
  sliderHandle.style.left = `${initialPosition}%`;
  sliderButton.style.left = `${initialPosition}%`;
  beforeImage.style.clipPath = `inset(0 ${100 - initialPosition}% 0 0)`;

  // Assemble layout (order matters for z-index)
  sliderHandle.appendChild(sliderButton);
  container.appendChild(afterImage);
  container.appendChild(beforeImage);
  container.appendChild(sliderHandle);

  return {
    container,
    beforeImage,
    afterImage,
    sliderHandle,
    sliderButton,
  };
}
