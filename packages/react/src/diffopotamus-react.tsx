import {
  type BasePlugin,
  Diffopotamus,
  type DiffopotamusConfig,
  OverlayPlugin,
  type PluginConfig,
  SideBySidePlugin,
  SliderPlugin,
} from "@diffopotamus/core";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

export interface DiffopotamusReactProps
  extends Omit<DiffopotamusConfig, "plugins"> {
  plugin?: "slider" | "sideBySide" | "overlay" | string;
  plugins?: Record<string, new (config: PluginConfig) => BasePlugin>;
  className?: string;
  style?: React.CSSProperties;
}

export function DiffopotamusReact({
  beforeImage,
  afterImage,
  plugin = "slider",
  width = "100%",
  height = "400px",
  plugins = {},
  onPluginChange,
  onImageLoad,
  onError,
  onImageLoadStart,
  className = "",
  style = {},
}: DiffopotamusReactProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const diffopotamus = useRef<Diffopotamus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const config = useMemo<DiffopotamusConfig>(
    () => ({
      beforeImage,
      afterImage,
      defaultPlugin: plugin,
      width,
      height,
      onPluginChange: (pluginName: string) => {
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
      ...(onImageLoadStart && { onImageLoadStart }),
    }),
    [
      beforeImage,
      afterImage,
      plugin,
      width,
      height,
      onPluginChange,
      onImageLoad,
      onError,
      onImageLoadStart,
    ],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous instance
    if (diffopotamus.current) {
      diffopotamus.current.destroy();
      diffopotamus.current = null;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Create new instance with memoized config
      diffopotamus.current = new Diffopotamus(containerRef.current, config);

      // Register built-in plugins
      diffopotamus.current.registerPlugin("slider", SliderPlugin);
      diffopotamus.current.registerPlugin("sideBySide", SideBySidePlugin);
      diffopotamus.current.registerPlugin("overlay", OverlayPlugin);

      // Register custom plugins
      Object.entries(plugins).forEach(([name, PluginClass]) => {
        diffopotamus.current?.registerPlugin(name, PluginClass);
      });
    } catch (err) {
      setError((err as Error).message);
      setIsLoading(false);
      onError?.(err as Error);
    }

    return () => {
      if (diffopotamus.current) {
        diffopotamus.current.destroy();
        diffopotamus.current = null;
      }
    };
  }, [config, plugins, onError]);

  const containerStyle: React.CSSProperties = {
    width,
    height,
    position: "relative",
    ...style,
  };

  if (error) {
    return (
      <div
        className={`diffopotamus-error ${className}`.trim()}
        style={containerStyle}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            backgroundColor: "#f5f5f5",
            border: "2px dashed #ddd",
            borderRadius: "8px",
            color: "#666",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>⚠️</div>
            <div style={{ fontSize: "16px", marginBottom: "4px" }}>
              Error loading images
            </div>
            <div style={{ fontSize: "14px", opacity: 0.7 }}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`diffopotamus-react ${className}`.trim()}
      style={containerStyle}
    >
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontFamily: "Arial, sans-serif",
              color: "#666",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                border: "2px solid #ddd",
                borderTop: "2px solid #666",
                borderRadius: "50%",
                animation: "diffopotamus-spin 1s linear infinite",
              }}
            />
            <span>Loading images...</span>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          opacity: isLoading ? 0 : 1,
          transition: "opacity 0.3s ease",
        }}
      />
      <style>
        {`
          @keyframes diffopotamus-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
