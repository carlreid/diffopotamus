import type { StateManager } from "../state/state-manager.js";
import type { SliderElements } from "../types/slider-types.js";

export class EventController {
  private stateManager: StateManager;
  private cleanup: Array<() => void> = [];

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  attachEvents(elements: SliderElements): void {
    this.attachMouseEvents(elements);
    this.attachTouchEvents(elements);
    this.attachClickEvents(elements);
  }

  private attachMouseEvents(elements: SliderElements): void {
    const { sliderButton } = elements;

    const handleMouseDown = (e: MouseEvent) => {
      this.stateManager.setDragging(true);
      e.preventDefault();
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const state = this.stateManager.getState();
      if (!state.isDragging) return;

      const position = this.calculatePosition(e.clientX, e.clientY, elements);
      if (position) {
        this.stateManager.setPosition(position.horizontal);
        this.stateManager.setButtonVerticalPosition(position.vertical);
      }
    };

    const handleMouseUp = () => {
      this.stateManager.setDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    sliderButton.addEventListener("mousedown", handleMouseDown);
    this.cleanup.push(() =>
      sliderButton.removeEventListener("mousedown", handleMouseDown),
    );
  }

  private attachTouchEvents(elements: SliderElements): void {
    const { sliderButton } = elements;

    const handleTouchStart = (e: TouchEvent) => {
      this.stateManager.setDragging(true);
      e.preventDefault();
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const state = this.stateManager.getState();
      if (!state.isDragging || !e.touches[0]) return;

      const touch = e.touches[0];
      const position = this.calculatePosition(
        touch.clientX,
        touch.clientY,
        elements,
      );
      if (position) {
        this.stateManager.setPosition(position.horizontal);
        this.stateManager.setButtonVerticalPosition(position.vertical);
      }
    };

    const handleTouchEnd = () => {
      this.stateManager.setDragging(false);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };

    sliderButton.addEventListener("touchstart", handleTouchStart);
    this.cleanup.push(() =>
      sliderButton.removeEventListener("touchstart", handleTouchStart),
    );
  }

  private attachClickEvents(elements: SliderElements): void {
    const { sliderHandle } = elements;

    const handleClick = (e: MouseEvent | TouchEvent) => {
      // Only handle clicks/touches on the slider handle itself, not on the button
      if (e.target !== sliderHandle) return;

      let clientX: number;
      let clientY: number;

      if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else if (e instanceof TouchEvent && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        return;
      }

      const position = this.calculatePosition(clientX, clientY, elements);
      if (position) {
        this.stateManager.setPosition(position.horizontal);
        this.stateManager.setButtonVerticalPosition(position.vertical);

        // Start dragging from this new position
        this.stateManager.setDragging(true);

        const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
          let moveX: number;
          let moveY: number;

          if (moveEvent instanceof MouseEvent) {
            moveX = moveEvent.clientX;
            moveY = moveEvent.clientY;
          } else if (moveEvent instanceof TouchEvent && moveEvent.touches[0]) {
            moveX = moveEvent.touches[0].clientX;
            moveY = moveEvent.touches[0].clientY;
          } else {
            return;
          }

          const newPosition = this.calculatePosition(moveX, moveY, elements);
          if (newPosition) {
            this.stateManager.setPosition(newPosition.horizontal);
            this.stateManager.setButtonVerticalPosition(newPosition.vertical);
          }
        };

        const handleEnd = () => {
          this.stateManager.setDragging(false);
          document.removeEventListener(
            "mousemove",
            handleMove as EventListener,
          );
          document.removeEventListener("mouseup", handleEnd);
          document.removeEventListener(
            "touchmove",
            handleMove as EventListener,
          );
          document.removeEventListener("touchend", handleEnd);
        };

        document.addEventListener("mousemove", handleMove as EventListener);
        document.addEventListener("mouseup", handleEnd);
        document.addEventListener("touchmove", handleMove as EventListener);
        document.addEventListener("touchend", handleEnd);

        e.preventDefault();
      }
    };

    sliderHandle.addEventListener("mousedown", handleClick as EventListener);
    sliderHandle.addEventListener("touchstart", handleClick as EventListener);

    this.cleanup.push(() => {
      sliderHandle.removeEventListener(
        "mousedown",
        handleClick as EventListener,
      );
      sliderHandle.removeEventListener(
        "touchstart",
        handleClick as EventListener,
      );
    });
  }

  private calculatePosition(
    clientX: number,
    clientY: number,
    elements: SliderElements,
  ): {
    horizontal: number;
    vertical: number;
  } | null {
    const { container, beforeImage } = elements;

    const containerRect = container.getBoundingClientRect();
    const imageRect = beforeImage.getBoundingClientRect();

    // Calculate position within container bounds
    const x = Math.max(
      0,
      Math.min(containerRect.width, clientX - containerRect.left),
    );
    const y = Math.max(
      0,
      Math.min(containerRect.height, clientY - containerRect.top),
    );

    // Calculate horizontal percentage relative to the actual image bounds
    const imageLeft = imageRect.left - containerRect.left;
    const imageRight = imageLeft + imageRect.width;
    const relativeX = Math.max(imageLeft, Math.min(imageRight, x));
    const horizontalPercentage =
      ((relativeX - imageLeft) / imageRect.width) * 100;

    // Calculate vertical percentage for button position
    const verticalPercentage = (y / containerRect.height) * 100;

    return {
      horizontal: horizontalPercentage,
      vertical: verticalPercentage,
    };
  }

  destroy(): void {
    for (const cleanupFn of this.cleanup) {
      cleanupFn();
    }
    this.cleanup.length = 0;
  }
}
