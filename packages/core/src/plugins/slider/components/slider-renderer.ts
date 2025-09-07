import type { SliderConfig, SliderElements } from "../types/slider-types.js";
import { createSliderLayout } from "./element-factory.js";

export class SliderRenderer {
  private elements: SliderElements | null = null;

  create(config: SliderConfig): SliderElements {
    const layoutConfig: {
      initialPosition?: number;
      buttonIcon?: string;
    } = {};

    if (config.initialPosition !== undefined)
      layoutConfig.initialPosition = config.initialPosition;
    if (config.buttonIcon) layoutConfig.buttonIcon = config.buttonIcon;

    const layout = createSliderLayout(
      config.images.before,
      config.images.after,
      layoutConfig,
    );

    this.elements = {
      container: layout.container,
      beforeImage: layout.beforeImage,
      afterImage: layout.afterImage,
      sliderHandle: layout.sliderHandle,
      sliderButton: layout.sliderButton,
    };

    return this.elements;
  }

  updatePosition(percentage: number): void {
    if (!this.elements) return;

    const { sliderHandle, sliderButton, beforeImage, container } =
      this.elements;

    // Clamp percentage to valid range
    const clampedPercentage = Math.max(0, Math.min(100, percentage));

    // Get the actual rendered dimensions and position of the image
    const imageRect = beforeImage.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Calculate the image's actual position within the container
    const imageLeft = imageRect.left - containerRect.left;
    const imageWidth = imageRect.width;

    // Calculate the slider position relative to the image, not the container
    const imageRelativePosition =
      imageLeft + (imageWidth * clampedPercentage) / 100;
    const containerRelativePercentage =
      (imageRelativePosition / containerRect.width) * 100;

    // Move the slider handle to align with the image boundary
    sliderHandle.style.left = `${containerRelativePercentage}%`;
    sliderButton.style.left = `${containerRelativePercentage}%`;

    // Use clip-path to reveal the before image from left to the slider position
    const rightClip = 100 - clampedPercentage;
    beforeImage.style.clipPath = `inset(0 ${rightClip}% 0 0)`;
  }

  updateButtonVerticalPosition(percentage: number): void {
    if (!this.elements) return;

    const clampedPercentage = Math.max(5, Math.min(95, percentage));
    this.elements.sliderButton.style.top = `${clampedPercentage}%`;
  }

  setDraggingState(isDragging: boolean): void {
    if (!this.elements) return;

    if (isDragging) {
      this.elements.sliderButton.classList.add(
        "diffopotamus-slider-button--dragging",
      );
    } else {
      this.elements.sliderButton.classList.remove(
        "diffopotamus-slider-button--dragging",
      );
    }
  }

  updateImages(beforeSrc: string, afterSrc: string): void {
    if (!this.elements) return;

    this.elements.beforeImage.src = beforeSrc;
    this.elements.afterImage.src = afterSrc;
  }

  get(): SliderElements | null {
    return this.elements;
  }

  destroy(): void {
    if (this.elements?.container.parentNode) {
      this.elements.container.parentNode.removeChild(this.elements.container);
    }
    this.elements = null;
  }
}
