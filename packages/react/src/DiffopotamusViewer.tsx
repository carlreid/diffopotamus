import {
  Diffopotamus,
  type DiffopotamusConfig,
  OverlayPlugin,
  SideBySidePlugin,
  SliderPlugin,
} from "@diffopotamus/core";
import type React from "react";
import { useEffect, useRef } from "react";
import type { DiffopotamusViewerProps } from "./types.js";

export const DiffopotamusViewer: React.FC<DiffopotamusViewerProps> = ({
  beforeImage,
  afterImage,
  defaultPlugin,
  width,
  height,
  plugins,
  className = "",
  style,
  onPluginChange,
  onImageLoad,
  onImageLoadStart,
  onError,
  onReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<Diffopotamus | null>(null);

  // Use refs for callbacks to avoid re-initialization on every callback change
  const callbacksRef = useRef({
    onPluginChange,
    onImageLoad,
    onImageLoadStart,
    onError,
    onReady,
  });

  // Update callbacks ref on each render
  callbacksRef.current = {
    onPluginChange,
    onImageLoad,
    onImageLoadStart,
    onError,
    onReady,
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let diffopotamus: Diffopotamus | null = null;

    const initDiffopotamus = async () => {
      try {
        const config: DiffopotamusConfig = {
          beforeImage,
          afterImage,
        };

        // Add optional properties only if they're defined
        if (callbacksRef.current.onImageLoadStart) {
          config.onImageLoadStart = callbacksRef.current.onImageLoadStart;
        }
        if (callbacksRef.current.onImageLoad) {
          config.onImageLoad = callbacksRef.current.onImageLoad;
        }
        if (callbacksRef.current.onError) {
          config.onError = callbacksRef.current.onError;
        }
        if (callbacksRef.current.onPluginChange) {
          config.onPluginChange = callbacksRef.current.onPluginChange;
        }
        if (width) config.width = width;
        if (height) config.height = height;
        if (plugins) config.plugins = plugins;

        // Create instance without defaultPlugin first
        const tempConfig = { ...config };

        diffopotamus = new Diffopotamus(container, tempConfig);
        instanceRef.current = diffopotamus;

        // Register default plugins
        diffopotamus.registerPlugin("slider", SliderPlugin);
        diffopotamus.registerPlugin("sideBySide", SideBySidePlugin);
        diffopotamus.registerPlugin("overlay", OverlayPlugin);

        // Now activate the default plugin if specified
        if (defaultPlugin) {
          await diffopotamus.activatePlugin(defaultPlugin);
        }

        // Call onReady callback if provided
        if (callbacksRef.current.onReady) {
          callbacksRef.current.onReady(diffopotamus);
        }
      } catch (error) {
        console.error("Failed to initialize Diffopotamus:", error);
        if (callbacksRef.current.onError && error instanceof Error) {
          callbacksRef.current.onError(error);
        }
      }
    };

    initDiffopotamus();

    // Cleanup function
    return () => {
      if (diffopotamus) {
        diffopotamus.destroy();
        diffopotamus = null;
        instanceRef.current = null;
      }
    };
  }, [
    beforeImage,
    afterImage,
    defaultPlugin,
    width,
    height,
    plugins,
    // Note: We intentionally don't include callback functions in dependencies
    // to avoid unnecessary re-initializations. They're handled via refs.
  ]);

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: width || "100%",
    height: height || "400px",
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={`diffopotamus-react-container ${className}`.trim()}
      style={containerStyle}
    />
  );
};

DiffopotamusViewer.displayName = "DiffopotamusViewer";
