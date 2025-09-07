import type {
  BasePlugin,
  DiffopotamusConfig,
  PluginConfig,
} from "@diffopotamus/core";
import {
  Diffopotamus,
  OverlayPlugin,
  SideBySidePlugin,
  SliderPlugin,
} from "@diffopotamus/core";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UseDiffopotamusOptions
  extends Omit<DiffopotamusConfig, "plugins"> {
  plugin?: string;
  plugins?: Record<string, new (config: PluginConfig) => BasePlugin>;
}

export interface UseDiffopotamusReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
  error: string | null;
  diffopotamus: Diffopotamus | null;
  switchPlugin: (pluginName: string) => Promise<void>;
  availablePlugins: string[];
  currentPlugin: string | null;
}

export function useDiffopotamus(
  options: UseDiffopotamusOptions,
): UseDiffopotamusReturn {
  const {
    beforeImage,
    afterImage,
    plugin = "slider",
    width,
    height,
    plugins = {},
    onPluginChange,
    onImageLoad,
    onError,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const diffopotamusRef = useRef<Diffopotamus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availablePlugins, setAvailablePlugins] = useState<string[]>([]);
  const [currentPlugin, setCurrentPlugin] = useState<string | null>(null);

  const switchPlugin = useCallback(
    async (pluginName: string) => {
      if (diffopotamusRef.current) {
        try {
          await diffopotamusRef.current.activatePlugin(pluginName);
          setCurrentPlugin(pluginName);
        } catch (err) {
          setError((err as Error).message);
          onError?.(err as Error);
        }
      }
    },
    [onError],
  );

  useEffect(() => {
    if (!containerRef.current || !beforeImage || !afterImage) return;

    // Clean up previous instance
    if (diffopotamusRef.current) {
      diffopotamusRef.current.destroy();
      diffopotamusRef.current = null;
    }

    const cleanup = () => {
      if (diffopotamusRef.current) {
        diffopotamusRef.current.destroy();
        diffopotamusRef.current = null;
      }
    };

    try {
      setIsLoading(true);
      setError(null);

      const config: DiffopotamusConfig = {
        beforeImage,
        afterImage,
        defaultPlugin: plugin,
        ...(width !== undefined && { width }),
        ...(height !== undefined && { height }),
        onPluginChange: (pluginName: string) => {
          setCurrentPlugin(pluginName);
          onPluginChange?.(pluginName);
        },
        onImageLoad: (images: {
          before: HTMLImageElement;
          after: HTMLImageElement;
        }) => {
          setIsLoading(false);
          onImageLoad?.(images);
        },
        onError: (err: Error) => {
          setError(err.message);
          setIsLoading(false);
          onError?.(err);
        },
      };

      // Create new instance
      diffopotamusRef.current = new Diffopotamus(containerRef.current, config);

      // Register built-in plugins
      diffopotamusRef.current.registerPlugin("slider", SliderPlugin);
      diffopotamusRef.current.registerPlugin("sideBySide", SideBySidePlugin);
      diffopotamusRef.current.registerPlugin("overlay", OverlayPlugin);

      // Register custom plugins
      Object.entries(plugins).forEach(([name, PluginClass]) => {
        diffopotamusRef.current?.registerPlugin(name, PluginClass);
      });

      // Update available plugins
      setAvailablePlugins(diffopotamusRef.current.getAvailablePlugins());
      setCurrentPlugin(plugin);
    } catch (err) {
      setError((err as Error).message);
      setIsLoading(false);
      onError?.(err as Error);
    }

    return cleanup;
  }, [
    beforeImage,
    afterImage,
    plugin,
    height,
    width,
    plugins,
    onPluginChange,
    onImageLoad,
    onError,
  ]);

  return {
    containerRef,
    isLoading,
    error,
    diffopotamus: diffopotamusRef.current,
    switchPlugin,
    availablePlugins,
    currentPlugin,
  };
}
