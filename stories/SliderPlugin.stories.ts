import type { Meta, StoryObj } from "@storybook/html-vite";

const meta: Meta = {
  title: "Diffopotamus/Plugins/Slider Plugin",
  parameters: {
    docs: {
      description: {
        component:
          "The Slider Plugin allows users to drag a slider to reveal before/after images. Features include draggable slider handle, click-to-move functionality, and both mouse and touch support.",
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
      defaultValue: "/before.png",
    },
    afterImage: {
      control: { type: "text" },
      description: "URL of the after image",
      defaultValue: "/after.png",
    },
  },
};

export default meta;
type Story = StoryObj<{
  width: string;
  height: string;
  beforeImage: string;
  afterImage: string;
}>;

export const Default: Story = {
  args: {
    width: "100%",
    height: "400px",
    beforeImage: "/before.png",
    afterImage: "/after.png",
  },
  render: (args) => {
    const wrapper = document.createElement("div");
    wrapper.style.width = "100%";
    wrapper.style.height = args.height;
    wrapper.style.minHeight = "400px";
    wrapper.style.display = "block";
    wrapper.style.position = "relative";

    const container = document.createElement("div");
    container.style.width = args.width;
    container.style.height = args.height;
    container.style.display = "block";
    container.style.position = "relative";

    wrapper.appendChild(container);

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(async () => {
      try {
        const { Diffopotamus, SliderPlugin } = await import(
          "../packages/core/dist/index.js"
        );

        const differ = new Diffopotamus(container, {
          beforeImage: args.beforeImage,
          afterImage: args.afterImage,
          width: args.width,
          height: args.height,
        });

        differ.registerPlugin("slider", SliderPlugin);
        await differ.activatePlugin("slider");
      } catch (error) {
        console.error("Failed to initialize slider plugin:", error);
        container.innerHTML = `<div style="padding: 20px;">Failed to load Slider Plugin: ${error.message}</div>`;
      }
    });

    return wrapper;
  },
};
