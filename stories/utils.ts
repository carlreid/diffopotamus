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
