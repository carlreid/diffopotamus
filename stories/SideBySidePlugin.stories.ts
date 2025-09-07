import type { Meta, StoryObj } from "@storybook/html-vite";
import type { SideBySideConfig } from "../packages/core/dist/plugins/side-by-side/index.js";
import { createStoryContainer, sampleImages } from "./utils";

const meta: Meta = {
  title: "Diffopotamus/Plugins/Side by Side Plugin",
  parameters: {
    docs: {
      description: {
        component:
          "The Side by Side Plugin displays the before and after images next to each other with labels. This provides a clear, static comparison view that's perfect for detailed analysis.",
      },
    },
  },
  argTypes: {
    width: {
      control: { type: "text" },
      description: "Width of the comparison container",
      defaultValue: "100%",
    },
    height: {
      control: { type: "text" },
      description: "Height of the comparison container",
      defaultValue: "400px",
    },
    beforeImage: {
      control: { type: "text" },
      description: "URL of the before image",
      defaultValue: sampleImages.before,
    },
    afterImage: {
      control: { type: "text" },
      description: "URL of the after image",
      defaultValue: sampleImages.after,
    },
    showLabels: {
      control: { type: "boolean" },
      description: "Show or hide the Before/After labels",
      defaultValue: true,
    },
  },
};

export default meta;
type Story = StoryObj<{
  width: string;
  height: string;
  beforeImage: string;
  afterImage: string;
  showLabels: boolean;
}>;

export const Default: Story = {
  args: {
    width: "100%",
    height: "400px",
    beforeImage: sampleImages.before,
    afterImage: sampleImages.after,
    showLabels: true,
  },
  render: (args) => {
    const container = createStoryContainer();
    container.style.height = args.height;
    container.style.width = args.width;

    setTimeout(async () => {
      try {
        const { Diffopotamus, SideBySidePlugin } = await import(
          "../packages/core/dist/index.js"
        );

        const differ = new Diffopotamus(container, {
          beforeImage: args.beforeImage,
          afterImage: args.afterImage,
          defaultPlugin: "sideBySide",
          width: args.width,
          height: args.height,
        });

        const ConfiguredSideBySidePlugin = class extends SideBySidePlugin {
          constructor(config: SideBySideConfig) {
            super({ ...config, showLabels: args.showLabels });
          }
        };

        differ.registerPlugin("sideBySide", ConfiguredSideBySidePlugin);
      } catch (error) {
        console.error("Failed to initialize side-by-side plugin:", error);
        container.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999; flex-direction: column;">
            <div style="font-size: 1.5em; margin-bottom: 5px;">⚠️</div>
            <div style="font-size: 0.8em;">Failed to load Side by Side Plugin</div>
          </div>
        `;
      }
    }, 100);

    return container;
  },
};

export const WithoutLabels: Story = {
  args: {
    width: "100%",
    height: "400px",
    beforeImage: sampleImages.before,
    afterImage: sampleImages.after,
    showLabels: false,
  },
  render: (args) => {
    const container = createStoryContainer();
    container.style.height = args.height;
    container.style.width = args.width;

    setTimeout(async () => {
      try {
        const { Diffopotamus, SideBySidePlugin } = await import(
          "../packages/core/dist/index.js"
        );

        const differ = new Diffopotamus(container, {
          beforeImage: args.beforeImage,
          afterImage: args.afterImage,
          width: args.width,
          height: args.height,
        });

        // Create a plugin class that respects the showLabels argument
        const ConfiguredSideBySidePlugin = class extends SideBySidePlugin {
          // biome-ignore lint/suspicious/noExplicitAny: Plugin constructor config requires any
          constructor(config: any) {
            super({ ...config, showLabels: args.showLabels });
          }
        };

        differ.registerPlugin("sideBySide", ConfiguredSideBySidePlugin);
        await differ.activatePlugin("sideBySide");
      } catch (error) {
        console.error("Failed to initialize side-by-side plugin:", error);
        container.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999; flex-direction: column;">
            <div style="font-size: 1.5em; margin-bottom: 5px;">⚠️</div>
            <div style="font-size: 0.8em;">Failed to load Side by Side Plugin</div>
          </div>
        `;
      }
    }, 100);

    return container;
  },
  parameters: {
    docs: {
      description: {
        story:
          "Side by Side plugin with labels hidden. This shows a clean comparison view without the 'Before' and 'After' text overlays.",
      },
    },
  },
};
