import type { SliderState } from "../types/slider-types.js";

export class StateManager {
  private state: SliderState;
  private listeners: Array<(state: SliderState) => void> = [];

  constructor(initialState: Partial<SliderState> = {}) {
    this.state = {
      position: 50,
      isDragging: false,
      buttonVerticalPosition: 50,
      ...initialState,
    };
  }

  getState(): SliderState {
    return { ...this.state };
  }

  updateState(updates: Partial<SliderState>): void {
    this.state = { ...this.state, ...updates };

    // Notify all listeners
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  onStateChange(listener: (state: SliderState) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Specific update methods
  setPosition(position: number): void {
    this.updateState({ position: Math.max(0, Math.min(100, position)) });
  }

  setDragging(isDragging: boolean): void {
    this.updateState({ isDragging });
  }

  setButtonVerticalPosition(position: number): void {
    this.updateState({
      buttonVerticalPosition: Math.max(5, Math.min(95, position)),
    });
  }

  reset(): void {
    this.state = {
      position: 50,
      isDragging: false,
      buttonVerticalPosition: 50,
    };

    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  destroy(): void {
    this.listeners.length = 0;
  }
}
