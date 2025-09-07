import type { ImageElements } from "../types/overlay-types.js";
import { createContainer, createImageElement } from "./element-factory.js";

export class ImageRenderer {
  private elements: ImageElements | null = null;

  create(beforeImageSrc: string, afterImageSrc: string): ImageElements {
    const container = createContainer("diffopotamus-overlay-images");

    const beforeImg = createImageElement(
      beforeImageSrc,
      "Before image",
      "before",
    );

    const afterImg = createImageElement(afterImageSrc, "After image", "after");

    container.appendChild(beforeImg);
    container.appendChild(afterImg);

    this.elements = {
      container,
      beforeImg,
      afterImg,
    };

    return this.elements;
  }

  updateOpacity(opacity: number): void {
    if (!this.elements) return;
    this.elements.afterImg.style.opacity = opacity.toString();
  }

  get(): ImageElements | null {
    return this.elements;
  }

  destroy(): void {
    if (this.elements?.container.parentNode) {
      this.elements.container.parentNode.removeChild(this.elements.container);
    }
    this.elements = null;
  }
}
