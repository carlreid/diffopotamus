export interface SliderElements {
  container: HTMLElement;
  beforeImage: HTMLImageElement;
  afterImage: HTMLImageElement;
  sliderHandle: HTMLElement;
  sliderButton: HTMLElement;
}

export interface SliderConfig {
  images: {
    before: string;
    after: string;
  };
  initialPosition?: number; // 0-100 percentage
  buttonIcon?: string;
  orientation?: "horizontal" | "vertical";
}

export interface SliderState {
  position: number; // 0-100 percentage
  isDragging: boolean;
  buttonVerticalPosition: number; // For vertical positioning of button
}

export interface Position {
  x: number;
  y: number;
}

export interface Bounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}
