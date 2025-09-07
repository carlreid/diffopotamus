export class StyleManager {
  private static readonly STYLE_ID = "diffopotamus-slider-styles";
  private static instance: StyleManager | null = null;
  private isInjected: boolean = false;

  static getInstance(): StyleManager {
    if (!StyleManager.instance) {
      StyleManager.instance = new StyleManager();
    }
    return StyleManager.instance;
  }

  injectStyles(): void {
    if (this.isInjected || document.getElementById(StyleManager.STYLE_ID)) {
      return;
    }

    this.createStyleElement();
    this.isInjected = true;
  }

  removeStyles(): void {
    const existingStyle = document.getElementById(StyleManager.STYLE_ID);
    if (existingStyle) {
      existingStyle.remove();
      this.isInjected = false;
    }
  }

  private createStyleElement(): void {
    const style = document.createElement("style");
    style.id = StyleManager.STYLE_ID;
    style.textContent = this.getCSSContent();
    document.head.appendChild(style);
  }

  private getCSSContent(): string {
    return `
/* Slider Plugin Styles */
.diffopotamus-slider {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  height: 100%;
}

.diffopotamus-slider-handle {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background-color: #fff;
  cursor: ew-resize;
  z-index: 10;
  transform: translateX(-50%);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2);
}

.diffopotamus-slider-handle:hover {
  width: 3px;
  background-color: #007ACC;
}

.diffopotamus-slider-button {
  position: absolute;
  width: 24px;
  height: 24px;
  background-color: #fff;
  border: 2px solid #007ACC;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #007ACC;
  user-select: none;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.diffopotamus-slider-button:hover {
  background-color: #007ACC;
  color: white;
  transform: translate(-50%, -50%) scale(1.1);
}

.diffopotamus-slider-button:active {
  cursor: grabbing;
  transform: translate(-50%, -50%) scale(0.95);
}

.diffopotamus-slider-button--dragging {
  cursor: grabbing;
  background-color: #007ACC;
  color: white;
  transform: translate(-50%, -50%) scale(1.05);
}

.diffopotamus-slider-image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
}

.diffopotamus-slider-image--after {
  z-index: 1;
}

.diffopotamus-slider-image--before {
  z-index: 2;
  clip-path: inset(0 50% 0 0);
}

/* Touch-friendly adjustments */
@media (pointer: coarse) {
  .diffopotamus-slider-button {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
  
  .diffopotamus-slider-handle {
    width: 4px;
  }
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .diffopotamus-slider-button {
    width: 28px;
    height: 28px;
  }
}
`;
  }
}
