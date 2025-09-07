export const sampleImages = {
  before: "/before.png",
  after: "/after.png",
};

export const createDiffopotamus = async (
  container: string | HTMLElement,
  pluginName: string,
) => {
  const { Diffopotamus, SliderPlugin, SideBySidePlugin, OverlayPlugin } =
    await import("../packages/core/dist/index.js");

  const differ = new Diffopotamus(container, {
    beforeImage: sampleImages.before,
    afterImage: sampleImages.after,
    defaultPlugin: pluginName,
    width: "100%",
    height: "100%",
  });

  // Register all plugins
  differ.registerPlugin("slider", SliderPlugin);
  differ.registerPlugin("sideBySide", SideBySidePlugin);
  differ.registerPlugin("overlay", OverlayPlugin);

  return differ;
};

export const createStoryContainer = (): HTMLElement => {
  const container = document.createElement("div");
  container.style.border = "2px dashed #ddd";
  container.style.borderRadius = "8px";
  container.style.backgroundColor = "#f9f9f9";
  container.style.width = "100%";
  container.style.height = "100%";
  container.style.minHeight = "400px";
  container.style.maxHeight = "100%";
  container.style.overflow = "hidden";
  container.style.boxSizing = "border-box";
  container.style.display = "block";
  return container;
};

export const addPluginSwitcher = (
  container: HTMLElement,
  differ: { activatePlugin: (pluginName: string) => Promise<void> },
) => {
  const controlsContainer = document.createElement("div");
  controlsContainer.style.marginTop = "20px";
  controlsContainer.style.display = "flex";
  controlsContainer.style.gap = "10px";
  controlsContainer.style.flexWrap = "wrap";

  const plugins = [
    { name: "slider", label: "🔄 Slider" },
    { name: "sideBySide", label: "🎨 Side by Side" },
    { name: "overlay", label: "🌈 Overlay" },
  ];

  plugins.forEach((plugin) => {
    const button = document.createElement("button");
    button.textContent = plugin.label;
    button.style.padding = "8px 16px";
    button.style.backgroundColor = "#007cba";
    button.style.color = "white";
    button.style.border = "none";
    button.style.borderRadius = "4px";
    button.style.cursor = "pointer";
    button.style.fontSize = "14px";

    button.addEventListener("click", async () => {
      await differ.activatePlugin(plugin.name);

      // Update button states
      const buttons = controlsContainer.querySelectorAll("button");
      buttons.forEach((btn) => {
        (btn as HTMLButtonElement).style.backgroundColor = "#007cba";
      });
      button.style.backgroundColor = "#28a745";
    });

    controlsContainer.appendChild(button);
  });

  const wrapper = document.createElement("div");
  wrapper.appendChild(container);
  wrapper.appendChild(controlsContainer);

  return wrapper;
};
