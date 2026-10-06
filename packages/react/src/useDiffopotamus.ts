import {
  Diffopotamus,
  type DiffopotamusConfig,
  type LoadedImages,
  type PluginConstructor,
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
          afterImage: options.afterImage,
          onImageLoadStart: () => {
            setIsLoading(true);
            callbacksRef.current.onImageLoadStart?.();
          },
          onImageLoad: (images: LoadedImages) => {
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
        if (options.beforeImage !== undefined)
          config.beforeImage = options.beforeImage;

        // Add optional properties only if they have values
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

        diffopotamus = new Diffopotamus(container, config);
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
    async (image: ImageInput, afterImage?: ImageInput) => {
      if (!instance) {
        throw new Error("Diffopotamus instance not ready");
      }
      try {
        setError(null);
        setIsLoading(true);
        await instance.updateImages(image, afterImage);
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
    (name: string, PluginClass: PluginConstructor) => {
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
