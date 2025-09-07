import type { BasePluginConfig } from "../../../types";

export interface SideBySideElements {
  container: HTMLElement;
  beforeContainer: HTMLElement;
  afterContainer: HTMLElement;
  beforeImage: HTMLImageElement;
  afterImage: HTMLImageElement;
  beforeLabel: HTMLElement;
  afterLabel: HTMLElement;
}

export interface SideBySideConfig extends BasePluginConfig {
  labels?: {
    before: string;
    after: string;
  };
  showLabels?: boolean;
  orientation?: "horizontal" | "vertical";
  gap?: string;
}

export interface LabelConfig {
  text: string;
  className: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export interface ContainerConfig {
  className: string;
  orientation: "horizontal" | "vertical";
  gap?: string;
}
