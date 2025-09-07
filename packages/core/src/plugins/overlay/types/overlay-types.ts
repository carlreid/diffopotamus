import type { AnimationCurve } from "../animation-manager.js";

export interface ImageElements {
  container: HTMLElement;
  beforeImg: HTMLImageElement;
  afterImg: HTMLImageElement;
}

export interface ControlElements {
  container: HTMLElement;
  compact: HTMLElement;
  advanced: HTMLElement;
}

export interface SliderElements {
  opacity: HTMLInputElement;
  speed: HTMLInputElement;
  opacityValue: HTMLElement;
  speedValue: HTMLElement;
}

export interface ButtonElements {
  play: HTMLButtonElement;
  expand: HTMLButtonElement;
  before: HTMLButtonElement;
  after: HTMLButtonElement;
}

export interface SelectorElements {
  curve: HTMLSelectElement;
}

export interface OverlayElements {
  container: HTMLElement;
  imageContainer: HTMLElement;
  beforeImg: HTMLImageElement;
  afterImg: HTMLImageElement;
  controlsContainer: HTMLElement;
  compactControls: HTMLElement;
  advancedControls: HTMLElement;
  opacitySlider: HTMLInputElement;
  opacityValue: HTMLElement;
  beforeButton: HTMLButtonElement;
  afterButton: HTMLButtonElement;
  playButton: HTMLButtonElement;
  expandButton: HTMLButtonElement;
  curveSelector: HTMLSelectElement;
  speedSlider: HTMLInputElement;
  speedValue: HTMLElement;
}

export interface OverlayConfig {
  images: {
    before: string;
    after: string;
  };
  animations: AnimationCurve[];
  initialOpacity?: number;
  initialSpeed?: number;
}

export interface UIState {
  opacity: number;
  isPlaying: boolean;
  isExpanded: boolean;
  speed: number;
  selectedCurve: string;
}

export interface SliderConfig {
  type: "opacity" | "speed";
  min: string;
  max: string;
  step?: string;
  value: string;
  className: string;
  title: string;
  width?: string;
}

export interface ButtonConfig {
  text: string;
  className: string;
  title: string;
  type?: "button" | "submit" | "reset";
}

export interface SelectOption {
  value: string;
  text: string;
}

export interface SelectorConfig {
  options: SelectOption[];
  className: string;
  title: string;
}

export interface ThemeConfig {
  primaryColor?: string;
  backgroundColor?: string;
  borderRadius?: string;
  fontSize?: string;
}

export interface ResponsiveConfig {
  breakpoints?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export interface ControlsConfig {
  showAdvanced?: boolean;
  autoCollapse?: boolean;
  compactMode?: boolean;
}
