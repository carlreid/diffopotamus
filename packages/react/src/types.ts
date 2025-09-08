import type {
  BasePlugin,
  DiffopotamusConfig,
  PluginConfig,
} from "@diffopotamus/core";
import type { RefObject } from "react";

// Re-export ImageInput type from core types
export type ImageInput = string | URL | Blob | File | HTMLImageElement;

export interface DiffopotamusViewerProps
  extends Omit<
    DiffopotamusConfig,
    "onPluginChange" | "onImageLoad" | "onImageLoadStart" | "onError"
  > {
  className?: string;
  style?: React.CSSProperties;
  onPluginChange?: (pluginName: string) => void;
  onImageLoad?: (images: {
    before: HTMLImageElement;
    after: HTMLImageElement;
  }) => void;
  onImageLoadStart?: () => void;
  onError?: (error: Error) => void;
  onReady?: (instance: import("@diffopotamus/core").Diffopotamus) => void;
}

export interface UseDiffopotamusOptions extends DiffopotamusConfig {
  containerRef: RefObject<HTMLElement | null>;
}

export interface UseDiffopotamusReturn {
  instance: import("@diffopotamus/core").Diffopotamus | null;
  isLoading: boolean;
  isReady: boolean;
  error: Error | null;
  activatePlugin: (name: string) => Promise<void>;
  updateImages: (
    beforeImage: ImageInput,
    afterImage: ImageInput,
  ) => Promise<void>;
  registerPlugin: (
    name: string,
    PluginClass: new (config: PluginConfig) => BasePlugin,
  ) => void;
  getAvailablePlugins: () => string[];
  getCurrentPlugin: () => string | null;
}
