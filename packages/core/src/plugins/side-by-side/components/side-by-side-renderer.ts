import type {
  SideBySideConfig,
  SideBySideElements,
} from "../types/side-by-side-types.js";
import { createSideBySideLayout } from "./element-factory.js";

export class SideBySideRenderer {
  private elements: SideBySideElements | null = null;

  create(config: SideBySideConfig): SideBySideElements {
    const layoutConfig: {
      labels?: { before: string; after: string };
      showLabels?: boolean;
      orientation?: "horizontal" | "vertical";
      gap?: string;
    } = {};

    if (config.labels) layoutConfig.labels = config.labels;
    if (config.showLabels !== undefined)
      layoutConfig.showLabels = config.showLabels;
    if (config.orientation) layoutConfig.orientation = config.orientation;
    if (config.gap) layoutConfig.gap = config.gap;

    const layout = createSideBySideLayout(
      config.beforeImage.src,
      config.afterImage.src,
      layoutConfig,
    );

    this.elements = {
      container: layout.container,
      beforeContainer: layout.beforeContainer,
      afterContainer: layout.afterContainer,
      beforeImage: layout.beforeImage,
      afterImage: layout.afterImage,
      beforeLabel: layout.beforeLabel || document.createElement("div"),
      afterLabel: layout.afterLabel || document.createElement("div"),
    };

    return this.elements;
  }

  updateImages(beforeSrc: string, afterSrc: string): void {
    if (!this.elements) return;

    this.elements.beforeImage.src = beforeSrc;
    this.elements.afterImage.src = afterSrc;
  }

  updateLabels(beforeText: string, afterText: string): void {
    if (!this.elements) return;

    this.elements.beforeLabel.textContent = beforeText;
    this.elements.afterLabel.textContent = afterText;
  }

  setOrientation(orientation: "horizontal" | "vertical"): void {
    if (!this.elements) return;

    // Remove existing orientation classes
    this.elements.container.classList.remove(
      "diffopotamus-side-by-side--horizontal",
      "diffopotamus-side-by-side--vertical",
    );

    // Add new orientation class
    this.elements.container.classList.add(
      `diffopotamus-side-by-side--${orientation}`,
    );
  }

  setGap(gap: string): void {
    if (!this.elements) return;
    this.elements.container.style.gap = gap;
  }

  setShowLabels(showLabels: boolean): void {
    if (!this.elements) return;

    const { beforeLabel, afterLabel } = this.elements;

    if (showLabels) {
      beforeLabel.style.display = "";
      afterLabel.style.display = "";
    } else {
      beforeLabel.style.display = "none";
      afterLabel.style.display = "none";
    }
  }

  get(): SideBySideElements | null {
    return this.elements;
  }

  destroy(): void {
    if (this.elements?.container.parentNode) {
      this.elements.container.parentNode.removeChild(this.elements.container);
    }
    this.elements = null;
  }
}
