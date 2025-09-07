import type { Meta, StoryObj } from "@storybook/html-vite";
import { createDiffopotamus, createStoryContainer } from "./utils";

const meta: Meta = {
  title: "Diffopotamus/All Plugins Comparison",
  parameters: {
    docs: {
      description: {
        component:
          "Compare all available Diffopotamus plugins side by side to see their different approaches to image comparison.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const AllPlugins: Story = {
  render: () => {
    const wrapper = document.createElement("div");
    wrapper.style.display = "grid";
    wrapper.style.gridTemplateColumns = "repeat(auto-fit, minmax(300px, 1fr))";
    wrapper.style.gap = "20px";
    wrapper.style.padding = "20px";
    wrapper.style.height = "100vh";
    wrapper.style.maxHeight = "400px";
    wrapper.style.boxSizing = "border-box";

    const plugins = [
      {
        name: "slider",
        title: "🔄 Slider Plugin",
        description: "Drag to reveal before/after images",
      },
      {
        name: "sideBySide",
        title: "🎨 Side by Side Plugin",
        description: "View images side by side",
      },
      {
        name: "overlay",
        title: "🌈 Overlay Plugin",
        description: "Overlay images with opacity control",
      },
    ];

    plugins.forEach((plugin) => {
      const section = document.createElement("div");
      section.style.border = "1px solid #ddd";
      section.style.borderRadius = "8px";
      section.style.padding = "15px";
      section.style.backgroundColor = "#fff";
      section.style.display = "flex";
      section.style.flexDirection = "column";
      section.style.height = "100%";
      section.style.boxSizing = "border-box";

      const title = document.createElement("h3");
      title.textContent = plugin.title;
      title.style.margin = "0 0 10px 0";
      title.style.color = "#333";
      title.style.flexShrink = "0";

      const description = document.createElement("p");
      description.textContent = plugin.description;
      description.style.margin = "0 0 15px 0";
      description.style.fontSize = "0.9em";
      description.style.color = "#666";
      description.style.flexShrink = "0";

      const container = createStoryContainer();
      container.style.flex = "1";
      container.style.minHeight = "200px";
      container.style.overflow = "hidden";

      section.appendChild(title);
      section.appendChild(description);
      section.appendChild(container);

      // Initialize each plugin
      setTimeout(async () => {
        try {
          await createDiffopotamus(container, plugin.name);
        } catch (error) {
          console.error(`Failed to initialize ${plugin.name}:`, error);
          container.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999; flex-direction: column;">
              <div style="font-size: 1.5em; margin-bottom: 5px;">⚠️</div>
              <div style="font-size: 0.8em;">Failed to load ${plugin.title}</div>
            </div>
          `;
        }
      }, 100);

      wrapper.appendChild(section);
    });

    return wrapper;
  },
};
