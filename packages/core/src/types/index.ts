// Supported image input types
export type ImageInput = string | URL | Blob | File | HTMLImageElement;

export interface LoadedImages {
  before: HTMLImageElement | null;
  after: HTMLImageElement;
}

export interface PluginConstructor {
  new (config: BasePluginConfig): BasePlugin;
  readonly requiresImagePair?: boolean;
}

export interface DiffopotamusConfig {
  beforeImage?: ImageInput;
  afterImage: ImageInput;
  defaultPlugin?: string;
  width?: string | number;
  height?: string | number;
  plugins?: Record<string, PluginConstructor>;
  onPluginChange?: (pluginName: string) => void;
  onImageLoad?: (images: LoadedImages) => void;
  onImageLoadStart?: () => void;
  onError?: (error: Error) => void;
}

export interface BasePluginConfig {
  container: HTMLElement;
  beforeImage: HTMLImageElement | null;
  afterImage: HTMLImageElement;
  width: number;
  height: number;
  onPluginChange?: ((pluginName: string) => void) | undefined;
}

export interface PluginEventMap {
  "plugin:change": CustomEvent<{ pluginName: string }>;
  "plugin:render": CustomEvent<{ pluginName: string }>;
  "plugin:destroy": CustomEvent<{ pluginName: string }>;
  "image:load:start": CustomEvent<Record<string, never>>;
  "image:load": CustomEvent<{
    images: LoadedImages;
  }>;
  "image:error": CustomEvent<{ error: Error }>;
}

export abstract class BasePlugin {
  static readonly requiresImagePair: boolean = true;
  protected container: HTMLElement;
  protected afterImage: HTMLImageElement;
  protected config: BasePluginConfig;
  protected isActive: boolean = false;

  constructor(config: BasePluginConfig) {
    this.container = config.container;
    this.afterImage = config.afterImage;
    this.config = config;
  }

  protected get beforeImage(): HTMLImageElement {
    if (!this.config.beforeImage) {
      throw new Error("This plugin requires before and after images");
    }
    return this.config.beforeImage;
  }

  abstract render(): void;
  abstract destroy(): void;

  activate(): void {
    this.isActive = true;
    this.render();
    this.dispatchEvent("plugin:render", { pluginName: this.constructor.name });
  }

  deactivate(): void {
    this.isActive = false;
    this.destroy();
    this.dispatchEvent("plugin:destroy", { pluginName: this.constructor.name });
  }

  protected dispatchEvent<K extends keyof PluginEventMap>(
    type: K,
    detail: PluginEventMap[K]["detail"],
  ): void {
    const event = new CustomEvent(type, { detail });
    this.container.dispatchEvent(event);
  }

  protected createPluginContainer(className: string): HTMLElement {
    const pluginContainer = document.createElement("div");
    pluginContainer.className = `diffopotamus-plugin ${className}`;
    pluginContainer.style.position = "relative";
    pluginContainer.style.width = "100%";
    pluginContainer.style.height = "100%";
    pluginContainer.style.overflow = "hidden";
    return pluginContainer;
  }

  protected createImageElement(src: string, alt: string): HTMLImageElement {
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.style.display = "block";
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.draggable = false;
    return img;
  }
}
