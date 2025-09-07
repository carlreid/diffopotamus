// Main library
export { Diffopotamus } from "./diffopotamus.js";
export { OverlayPlugin } from "./plugins/overlay/index.js";
export { SideBySidePlugin } from "./plugins/side-by-side/index.js";

// Built-in plugins
export { SliderPlugin } from "./plugins/slider/index.js";
// Types and interfaces
export type {
  BasePluginConfig as PluginConfig,
  DiffopotamusConfig,
  PluginEventMap,
} from "./types/index.js";
export { BasePlugin } from "./types/index.js";
