import type {
  BasePlugin,
  BasePluginConfig,
  DiffopotamusConfig,
  ImageInput,
  PluginEventMap,
} from "./types/index.js";

export class Diffopotamus {
  private container: HTMLElement;
  private config: DiffopotamusConfig;
  private plugins: Map<string, new (config: BasePluginConfig) => BasePlugin> =
    new Map();
  private activePlugin: BasePlugin | null = null;
  private beforeImage: HTMLImageElement | null = null;
  private afterImage: HTMLImageElement | null = null;
  private imagesLoaded = false;
  private isLoading = false;
  private pendingPluginActivation: string | null = null;

  constructor(
    containerSelector: string | HTMLElement,
    config: DiffopotamusConfig,
  ) {
    // Handle container selection
    if (typeof containerSelector === "string") {
      const element = document.querySelector(containerSelector);
      if (!element) {
        throw new Error(`Container element not found: ${containerSelector}`);
      }
      this.container = element as HTMLElement;
    } else {
      this.container = containerSelector;
    }

    this.config = config;
    this.init();
  }

  private async init(): Promise<void> {
    try {
      // Set up container styles
      this.setupContainer();

      // Load images
      await this.loadImages();

      // Dispatch image load event
      if (this.config.onImageLoad && this.beforeImage && this.afterImage) {
        this.config.onImageLoad({
          before: this.beforeImage,
          after: this.afterImage,
        });
      }

      this.dispatchEvent("image:load", {
        images: {
          before: this.beforeImage as HTMLImageElement,
          after: this.afterImage as HTMLImageElement,
        },
      });

      // Activate pending plugin if any
      if (this.pendingPluginActivation) {
        const pendingPlugin = this.pendingPluginActivation;
        this.pendingPluginActivation = null;
        await this.activatePlugin(pendingPlugin);
      }
      // Initialize default plugin if specified and no pending plugin
      else if (this.config.defaultPlugin) {
        await this.activatePlugin(this.config.defaultPlugin);
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private setupContainer(): void {
    this.container.className =
      `${this.container.className} diffopotamus-container`.trim();

    // Set container styles
    this.container.style.position = "relative";
    this.container.style.display = "block";
    this.container.style.overflow = "hidden";
    this.container.style.boxSizing = "border-box";

    if (this.config.width) {
      this.container.style.width =
        typeof this.config.width === "number"
          ? `${this.config.width}px`
          : this.config.width;
    }

    if (this.config.height) {
      this.container.style.height =
        typeof this.config.height === "number"
          ? `${this.config.height}px`
          : this.config.height;
    }

    // Ensure minimum dimensions if container has no computed size
    const computedStyle = window.getComputedStyle(this.container);
    const computedWidth = parseFloat(computedStyle.width);
    const computedHeight = parseFloat(computedStyle.height);

    if (computedWidth === 0 && !this.config.width) {
      this.container.style.width = "100%";
      this.container.style.minWidth = "300px";
    }

    if (computedHeight === 0 && !this.config.height) {
      this.container.style.height = "400px";
      this.container.style.minHeight = "200px";
    }
  }

  private async loadImages(): Promise<void> {
    // Dispatch loading start event
    if (this.config.onImageLoadStart) {
      this.config.onImageLoadStart();
    }
    this.dispatchEvent("image:load:start", {});

    this.isLoading = true;

    try {
      [this.beforeImage, this.afterImage] = await Promise.all([
        this.loadImageFromInput(this.config.beforeImage, "before"),
        this.loadImageFromInput(this.config.afterImage, "after"),
      ]);

      this.imagesLoaded = true;
    } catch (error) {
      throw new Error(`Image loading failed: ${(error as Error).message}`);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadImageFromInput(
    input: ImageInput,
    type: "before" | "after",
  ): Promise<HTMLImageElement> {
    // If input is already an HTMLImageElement, clone it to avoid conflicts
    if (input instanceof HTMLImageElement) {
      const clonedImg = input.cloneNode() as HTMLImageElement;
      // Ensure the image is fully loaded
      if (!clonedImg.complete) {
        return new Promise((resolve, reject) => {
          clonedImg.onload = () => resolve(clonedImg);
          clonedImg.onerror = () =>
            reject(
              new Error(`Failed to load ${type} image from HTMLImageElement`),
            );
        });
      }
      return clonedImg;
    }

    // Convert input to a source URL
    let src: string;

    if (typeof input === "string") {
      src = input;
    } else if (input instanceof URL) {
      src = input.toString();
    } else if (input instanceof Blob) {
      src = URL.createObjectURL(input);
    } else {
      throw new Error(`Unsupported image input type for ${type} image`);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        // Clean up blob URL if we created one
        if (input instanceof Blob && src.startsWith("blob:")) {
          URL.revokeObjectURL(src);
        }
        resolve(img);
      };

      img.onerror = () => {
        // Clean up blob URL if we created one
        if (input instanceof Blob && src.startsWith("blob:")) {
          URL.revokeObjectURL(src);
        }
        reject(new Error(`Failed to load ${type} image: ${src}`));
      };

      img.src = src;
    });
  }

  registerPlugin(
    name: string,
    PluginClass: new (config: BasePluginConfig) => BasePlugin,
  ): void {
    this.plugins.set(name, PluginClass);
  }

  async activatePlugin(name: string): Promise<void> {
    // If images are still loading, store the plugin name to activate later
    if (this.isLoading) {
      this.pendingPluginActivation = name;
      return;
    }

    if (!this.imagesLoaded || !this.beforeImage || !this.afterImage) {
      throw new Error("Images must be loaded before activating plugin");
    }

    const PluginClass = this.plugins.get(name);
    if (!PluginClass) {
      throw new Error(`Plugin not found: ${name}`);
    }

    // Deactivate current plugin
    if (this.activePlugin) {
      this.activePlugin.deactivate();
    }

    // Clear container
    this.container.innerHTML = "";

    // Force a reflow to ensure container has proper dimensions
    this.container.offsetHeight;

    // Get container dimensions, with fallbacks for zero dimensions
    let containerWidth =
      this.container.clientWidth || this.container.offsetWidth;
    let containerHeight =
      this.container.clientHeight || this.container.offsetHeight;

    // Fallback dimensions if container still has no size
    if (containerWidth === 0) {
      containerWidth = 600; // reasonable default width
    }
    if (containerHeight === 0) {
      containerHeight = 400; // reasonable default height
    }

    // Create plugin config
    const pluginConfig: BasePluginConfig = {
      container: this.container,
      beforeImage: this.beforeImage,
      afterImage: this.afterImage,
      width: containerWidth,
      height: containerHeight,
      onPluginChange: this.config.onPluginChange,
    };

    // Create and activate new plugin
    this.activePlugin = new PluginClass(pluginConfig);
    this.activePlugin.activate();

    // Dispatch plugin change event
    if (this.config.onPluginChange) {
      this.config.onPluginChange(name);
    }

    this.dispatchEvent("plugin:change", { pluginName: name });
  }

  getAvailablePlugins(): string[] {
    return Array.from(this.plugins.keys());
  }

  getCurrentPlugin(): string | null {
    return this.activePlugin ? this.activePlugin.constructor.name : null;
  }

  isImagesLoaded(): boolean {
    return this.imagesLoaded;
  }

  isImagesLoading(): boolean {
    return this.isLoading;
  }

  async updateImages(
    beforeImage: ImageInput,
    afterImage: ImageInput,
  ): Promise<void> {
    const oldBeforeImage = this.beforeImage;
    const oldAfterImage = this.afterImage;
    const currentPluginName = this.activePlugin
      ? this.getCurrentPlugin()
      : null;

    try {
      this.config.beforeImage = beforeImage;
      this.config.afterImage = afterImage;

      // Deactivate current plugin
      if (this.activePlugin) {
        this.activePlugin.deactivate();
        this.activePlugin = null;
      }

      // Clear container and reset state
      this.container.innerHTML = "";
      this.imagesLoaded = false;

      // Load new images
      await this.loadImages();

      // Dispatch image load event
      if (this.config.onImageLoad && this.beforeImage && this.afterImage) {
        this.config.onImageLoad({
          before: this.beforeImage,
          after: this.afterImage,
        });
      }

      this.dispatchEvent("image:load", {
        images: {
          before: this.beforeImage as HTMLImageElement,
          after: this.afterImage as HTMLImageElement,
        },
      });

      // Reactivate the same plugin if there was one
      if (currentPluginName) {
        await this.activatePlugin(currentPluginName);
      }
    } catch (error) {
      // Restore previous images on error
      this.beforeImage = oldBeforeImage;
      this.afterImage = oldAfterImage;
      this.imagesLoaded = oldBeforeImage !== null && oldAfterImage !== null;

      this.handleError(error as Error);
      throw error;
    }
  }

  destroy(): void {
    if (this.activePlugin) {
      this.activePlugin.deactivate();
      this.activePlugin = null;
    }

    this.container.innerHTML = "";
    this.plugins.clear();
    this.beforeImage = null;
    this.afterImage = null;
    this.imagesLoaded = false;
    this.isLoading = false;
    this.pendingPluginActivation = null;
  }

  private handleError(error: Error): void {
    console.error("Diffopotamus Error:", error);

    if (this.config.onError) {
      this.config.onError(error);
    }

    this.dispatchEvent("image:error", { error });
  }

  private dispatchEvent<K extends keyof PluginEventMap>(
    type: K,
    detail: PluginEventMap[K]["detail"],
  ): void {
    const event = new CustomEvent(type, { detail });
    this.container.dispatchEvent(event);
  }

  // Public API for event listeners
  addEventListener<K extends keyof PluginEventMap>(
    type: K,
    listener: (event: PluginEventMap[K]) => void,
  ): void {
    this.container.addEventListener(type, listener as EventListener);
  }

  removeEventListener<K extends keyof PluginEventMap>(
    type: K,
    listener: (event: PluginEventMap[K]) => void,
  ): void {
    this.container.removeEventListener(type, listener as EventListener);
  }
}
