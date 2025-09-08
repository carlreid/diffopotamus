import {
  type BasePlugin,
  Diffopotamus,
  type DiffopotamusConfig,
  OverlayPlugin,
  type PluginConfig,
  SideBySidePlugin,
  SliderPlugin,
} from "@diffopotamus/core";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ImageInput,
  UseDiffopotamusOptions,
  UseDiffopotamusReturn,
} from "./types.js";

export function useDiffopotamus(
  options: UseDiffopotamusOptions,
): UseDiffopotamusReturn {
  const [instance, setInstance] = useState<Diffopotamus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use refs for callbacks to avoid re-initialization on every callback change
  const callbacksRef = useRef(options);
  callbacksRef.current = options;

  // Initialize instance
  // biome-ignore lint/correctness/useExhaustiveDependencies: Intentional avoid callbacks such asoptions.onPluginChange
  useEffect(() => {
    if (!options.containerRef.current) {
      return;
    }

    const container = options.containerRef.current;
    let diffopotamus: Diffopotamus | null = null;

    const initDiffopotamus = async () => {
      try {
        setError(null);
        setIsLoading(true);
        setIsReady(false);

        const config: DiffopotamusConfig = {
          beforeImage: options.beforeImage,
          afterImage: options.afterImage,
          onImageLoadStart: () => {
            setIsLoading(true);
            callbacksRef.current.onImageLoadStart?.();
          },
          onImageLoad: (images: {
            before: HTMLImageElement;
            after: HTMLImageElement;
          }) => {
            setIsLoading(false);
            setIsReady(true);
            callbacksRef.current.onImageLoad?.(images);
          },
          onError: (err: Error) => {
            setError(err);
            setIsLoading(false);
            setIsReady(false);
            callbacksRef.current.onError?.(err);
          },
        };

        // Add optional properties only if they have values
        if (options.defaultPlugin !== undefined) {
          config.defaultPlugin = options.defaultPlugin;
        }
        if (options.width !== undefined) {
          config.width = options.width;
        }
        if (options.height !== undefined) {
          config.height = options.height;
        }
        if (options.plugins !== undefined) {
          config.plugins = options.plugins;
        }
        if (options.onPluginChange !== undefined) {
          config.onPluginChange = (pluginName: string) => {
            callbacksRef.current.onPluginChange?.(pluginName);
          };
        }

        // Create instance without defaultPlugin first
        const tempConfig = { ...config };
        delete tempConfig.defaultPlugin;

        diffopotamus = new Diffopotamus(container, tempConfig);

        // Register default plugins
        diffopotamus.registerPlugin("slider", SliderPlugin);
        diffopotamus.registerPlugin("sideBySide", SideBySidePlugin);
        diffopotamus.registerPlugin("overlay", OverlayPlugin);

        // Now activate the default plugin if specified
        if (options.defaultPlugin) {
          await diffopotamus.activatePlugin(options.defaultPlugin);
        }

        setInstance(diffopotamus);
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error("Failed to initialize Diffopotamus");
        setError(error);
        setIsLoading(false);
        setIsReady(false);
      }
    };

    initDiffopotamus();

    // Cleanup
    return () => {
      if (diffopotamus) {
        diffopotamus.destroy();
        diffopotamus = null;
      }
      setInstance(null);
      setIsLoading(false);
      setIsReady(false);
      setError(null);
    };
  }, [
    options.containerRef,
    options.beforeImage,
    options.afterImage,
    options.defaultPlugin,
    options.width,
    options.height,
    options.plugins,
    // Note: We intentionally don't include callback functions in dependencies
    // to avoid unnecessary re-initializations. They're handled via refs.
  ]);

  // Helper methods
  const activatePlugin = useCallback(
    async (name: string) => {
      if (!instance) {
        throw new Error("Diffopotamus instance not ready");
      }
      try {
        setError(null);
        await instance.activatePlugin(name);
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error(`Failed to activate plugin: ${name}`);
        setError(error);
        throw error;
      }
    },
    [instance],
  );

  const updateImages = useCallback(
    async (beforeImage: ImageInput, afterImage: ImageInput) => {
      if (!instance) {
        throw new Error("Diffopotamus instance not ready");
      }
      try {
        setError(null);
        setIsLoading(true);
        await instance.updateImages(beforeImage, afterImage);
        setIsLoading(false);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to update images");
        setError(error);
        setIsLoading(false);
        throw error;
      }
    },
    [instance],
  );

  const registerPlugin = useCallback(
    (name: string, PluginClass: new (config: PluginConfig) => BasePlugin) => {
      if (!instance) {
        throw new Error("Diffopotamus instance not ready");
      }
      instance.registerPlugin(name, PluginClass);
    },
    [instance],
  );

  const getAvailablePlugins = useCallback(() => {
    if (!instance) return [];
    return instance.getAvailablePlugins();
  }, [instance]);

  const getCurrentPlugin = useCallback(() => {
    if (!instance) return null;
    return instance.getCurrentPlugin();
  }, [instance]);

  return {
    instance,
    isLoading,
    isReady,
    error,
    activatePlugin,
    updateImages,
    registerPlugin,
    getAvailablePlugins,
    getCurrentPlugin,
  };
}
