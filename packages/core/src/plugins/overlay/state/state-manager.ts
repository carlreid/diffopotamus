import type { UIState } from "../types/overlay-types.js";

export class StateManager {
  private state: UIState;
  private listeners: Array<(state: UIState) => void> = [];

  constructor(initialState: Partial<UIState> = {}) {
    this.state = {
      opacity: 50,
      isPlaying: false,
      isExpanded: false,
      speed: 1,
      selectedCurve: "ease",
      ...initialState,
    };
  }

  getState(): UIState {
    return { ...this.state };
  }

  updateState(updates: Partial<UIState>): void {
    this.state = { ...this.state, ...updates };

    // Notify all listeners
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  onStateChange(listener: (state: UIState) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Specific update methods for better type safety
  setOpacity(opacity: number): void {
    this.updateState({ opacity: Math.max(0, Math.min(100, opacity)) });
  }

  setPlayState(isPlaying: boolean): void {
    this.updateState({ isPlaying });
  }

  togglePlayState(): void {
    this.updateState({ isPlaying: !this.state.isPlaying });
  }

  setExpandState(isExpanded: boolean): void {
    this.updateState({ isExpanded });
  }

  toggleExpandState(): void {
    this.updateState({ isExpanded: !this.state.isExpanded });
  }

  setSpeed(speed: number): void {
    this.updateState({ speed: Math.max(0.25, Math.min(3, speed)) });
  }

  setCurve(selectedCurve: string): void {
    this.updateState({ selectedCurve });
  }

  reset(): void {
    this.state = {
      opacity: 50,
      isPlaying: false,
      isExpanded: false,
      speed: 1,
      selectedCurve: "ease",
    };

    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  destroy(): void {
    this.listeners.length = 0;
  }
}
