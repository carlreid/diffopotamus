// React hooks

export type {
  DiffopotamusConfig,
  PluginConfig,
  PluginEventMap,
} from "@diffopotamus/core";
// Re-export core library for convenience
export {
  BasePlugin,
  Diffopotamus,
  OverlayPlugin,
  SideBySidePlugin,
  SliderPlugin,
} from "@diffopotamus/core";
export type { DiffopotamusReactProps } from "./diffopotamus-react.js";
// React component
export { DiffopotamusReact } from "./diffopotamus-react.js";
export type {
  UseDiffopotamusOptions,
  UseDiffopotamusReturn,
} from "./use-diffopotamus.js";
export { useDiffopotamus } from "./use-diffopotamus.js";
