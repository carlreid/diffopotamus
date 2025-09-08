import type { Diffopotamus } from "@diffopotamus/core";
import { DiffopotamusViewer, useDiffopotamus } from "@diffopotamus/react";
import type React from "react";
import { useRef, useState } from "react";

const SAMPLE_IMAGES = {
  before: "/before.png",
  after: "/after.png",
};

const ComponentDemo: React.FC = () => {
  const [currentPlugin, setCurrentPlugin] = useState<string>("overlay");
  const [instanceRef, setInstanceRef] = useState<Diffopotamus | null>(null);

  const handlePluginChange = (pluginName: string) => {
    console.log("Plugin changed to:", pluginName);
    setCurrentPlugin(pluginName);
  };

  const handleReady = (instance: Diffopotamus) => {
    console.log("Diffopotamus instance ready:", instance);
    setInstanceRef(instance);
  };

  const switchPlugin = async (pluginName: string) => {
    if (instanceRef) {
      try {
        await instanceRef.activatePlugin(pluginName);
      } catch (error) {
        console.error("Failed to switch plugin:", error);
      }
    }
  };

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h2>Component Demo</h2>
      <div style={{ marginBottom: "1rem" }}>
        <button type="button" onClick={() => switchPlugin("overlay")}>
          Overlay
        </button>
        <button
          type="button"
          onClick={() => switchPlugin("sideBySide")}
          style={{ marginLeft: "0.5rem" }}
        >
          Side by Side
        </button>
        <button
          type="button"
          onClick={() => switchPlugin("slider")}
          style={{ marginLeft: "0.5rem" }}
        >
          Slider
        </button>
      </div>
      <p>Current Plugin: {currentPlugin}</p>
      <DiffopotamusViewer
        beforeImage={SAMPLE_IMAGES.before}
        afterImage={SAMPLE_IMAGES.after}
        defaultPlugin="overlay"
        width="600px"
        height="400px"
        onPluginChange={handlePluginChange}
        onReady={handleReady}
        onError={(error: Error) => console.error("Component error:", error)}
        style={{ border: "1px solid #ccc", borderRadius: "8px" }}
      />
    </div>
  );
};

const HookDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [_selectedPlugin, setSelectedPlugin] = useState<string>("sideBySide");

  const {
    isLoading,
    isReady,
    error,
    activatePlugin,
    getAvailablePlugins,
    getCurrentPlugin,
  } = useDiffopotamus({
    containerRef,
    beforeImage: SAMPLE_IMAGES.before,
    afterImage: SAMPLE_IMAGES.after,
    defaultPlugin: "sideBySide",
    width: "600px",
    height: "400px",
    onPluginChange: (pluginName) => {
      console.log("Hook plugin changed to:", pluginName);
      setSelectedPlugin(pluginName);
    },
    onError: (err) => console.error("Hook error:", err),
  });

  const handlePluginSwitch = async (pluginName: string) => {
    try {
      await activatePlugin(pluginName);
    } catch (error) {
      console.error("Failed to activate plugin:", error);
    }
  };

  const availablePlugins = getAvailablePlugins();
  const currentPlugin = getCurrentPlugin();

  return (
    <div>
      <h2>Hook Demo</h2>
      <div style={{ marginBottom: "1rem" }}>
        <p>
          Status: {isLoading ? "Loading..." : isReady ? "Ready" : "Not Ready"}
          {error && (
            <span style={{ color: "red" }}> | Error: {error.message}</span>
          )}
        </p>
        <p>Available Plugins: {availablePlugins.join(", ")}</p>
        <p>Current Plugin: {currentPlugin || "None"}</p>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        {availablePlugins.map((plugin) => (
          <button
            type="button"
            key={plugin}
            onClick={() => handlePluginSwitch(plugin)}
            disabled={isLoading || !isReady}
            style={{
              marginRight: "0.5rem",
              backgroundColor: currentPlugin === plugin ? "#007acc" : undefined,
              color: currentPlugin === plugin ? "white" : undefined,
            }}
          >
            {plugin}
          </button>
        ))}
      </div>
      <div
        ref={containerRef}
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          width: "600px",
          height: "400px",
          position: "relative",
        }}
      />
    </div>
  );
};

function App() {
  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Diffopotamus React Demo</h1>
      <p>
        This demo showcases both the Component and Hook approaches to using
        Diffopotamus in React.
      </p>

      <ComponentDemo />
      <HookDemo />
    </div>
  );
}

export default App;
