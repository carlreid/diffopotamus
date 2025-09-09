import type {
  ContainerConfig,
  LabelConfig,
} from "../types/side-by-side-types.js";

function createContainer(config: ContainerConfig): HTMLElement {
  const container = document.createElement("div");
  container.className = `${config.className} diffopotamus-side-by-side--${config.orientation}`;

  if (config.gap) {
    container.style.gap = config.gap;
  }

  return container;
}

function createImageContainer(className: string): HTMLElement {
  const container = document.createElement("div");
  container.className = className;
  return container;
}

function createImageElement(src: string, alt: string): HTMLImageElement {
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  img.className = "diffopotamus-side-by-side-image";
  img.draggable = false;
  return img;
}

function createLabel(config: LabelConfig): HTMLElement {
  const label = document.createElement("div");
  label.className = config.className;
  label.textContent = config.text;

  if (config.position) {
    label.classList.add(`diffopotamus-side-by-side-label--${config.position}`);
  }

  return label;
}

export function createSideBySideLayout(
  beforeImageSrc: string,
  afterImageSrc: string,
  config: {
    labels?: { before: string; after: string };
    showLabels?: boolean;
    orientation?: "horizontal" | "vertical";
    gap?: string;
  } = {},
) {
  const {
    labels = { before: "Before", after: "After" },
    showLabels = true,
    orientation = "horizontal",
    gap = "2px",
  } = config;

  // Create main container
  const container = createContainer({
    className: "diffopotamus-side-by-side",
    orientation,
    gap,
  });

  // Create before container and elements
  const beforeContainer = createImageContainer(
    "diffopotamus-side-by-side-container",
  );
  const beforeImage = createImageElement(beforeImageSrc, "Before image");
  beforeContainer.appendChild(beforeImage);

  // Create after container and elements
  const afterContainer = createImageContainer(
    "diffopotamus-side-by-side-container",
  );
  const afterImage = createImageElement(afterImageSrc, "After image");
  afterContainer.appendChild(afterImage);

  // Add labels if enabled
  let beforeLabel: HTMLElement | null = null;
  let afterLabel: HTMLElement | null = null;

  if (showLabels) {
    beforeLabel = createLabel({
      text: labels.before,
      className: "diffopotamus-side-by-side-label",
      position: "top-left",
    });

    afterLabel = createLabel({
      text: labels.after,
      className: "diffopotamus-side-by-side-label",
      position: "top-left",
    });

    beforeContainer.appendChild(beforeLabel);
    afterContainer.appendChild(afterLabel);
  }

  // Assemble layout
  container.appendChild(beforeContainer);
  container.appendChild(afterContainer);

  return {
    container,
    beforeContainer,
    afterContainer,
    beforeImage,
    afterImage,
    beforeLabel,
    afterLabel,
  };
}
