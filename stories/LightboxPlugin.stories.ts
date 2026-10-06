import type { DiffopotamusConfig } from "@diffopotamus/core";
import { LightboxPlugin } from "@diffopotamus/core/plugins/lightbox";
import type { Meta, StoryObj } from "@storybook/html-vite";
import "@diffopotamus/core/plugins/lightbox/styles.css";

interface LightboxArgs {
  width: string;
  height: string;
  beforeImage: string;
  afterImage: string;
}

const meta: Meta<LightboxArgs> = {
  title: "Diffopotamus/Plugins/Lightbox Plugin",
  parameters: {
    docs: {
      description: {
        component:
          "Inspect one image at a time with a full-size, bounded viewport and compact overlay controls. Scroll, pinch, or double-click to zoom; drag to pan. Open Image tools for zoom and annotation controls. Expand uses a native modal dialog. All controls have CSS styling hooks and theme variables; inherited themes stay active when expanded. Marks remain attached to image pixels and are temporary.",
      },
    },
  },
  argTypes: {
    width: { control: "text", description: "Viewer width" },
    height: { control: "text", description: "Viewer height" },
    beforeImage: { control: "text", description: "Before image URL" },
    afterImage: { control: "text", description: "After image URL" },
  },
  args: {
    width: "100%",
    height: "520px",
    beforeImage: "/before.png",
    afterImage: "/after.png",
  },
};
export default meta;
type Story = StoryObj<LightboxArgs>;

function renderViewer(
  args: LightboxArgs,
  start: "default" | "drawing" | "expanded" | "single" = "default",
): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.style.width = args.width;
  wrapper.style.maxWidth = "100%";
  const container = document.createElement("div");
  container.style.height = args.height;
  wrapper.append(container);
  requestAnimationFrame(async () => {
    const { Diffopotamus } = await import("@diffopotamus/core");
    if (!wrapper.isConnected) return;
    const config: DiffopotamusConfig = {
      afterImage: args.afterImage,
      plugins: { lightbox: LightboxPlugin },
      width: "100%",
      height: args.height,
      onError: (error) => {
        container.textContent = `Image inspection failed: ${error.message}`;
      },
    };
    if (start !== "single") config.beforeImage = args.beforeImage;
    const differ = new Diffopotamus(container, config);
    const observer = new MutationObserver(() => {
      if (!wrapper.isConnected) {
        observer.disconnect();
        differ.destroy();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    differ.addEventListener("plugin:render", () => {
      if (start === "drawing")
        container
          .querySelector<HTMLButtonElement>('[aria-label="Draw with pen"]')
          ?.click();
      if (start === "expanded")
        container
          .querySelector<HTMLButtonElement>(
            '[aria-label="Expand image inspection"]',
          )
          ?.click();
    });
    await differ.activatePlugin("lightbox");
  });
  return wrapper;
}

export const Default: Story = { render: (args) => renderViewer(args) };
export const SingleImage: Story = {
  argTypes: {
    beforeImage: { control: false, table: { disable: true } },
    afterImage: {
      name: "Image",
      control: "text",
      description: "The only image loaded by this viewer",
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Uses only afterImage: no before image, duplicate image input, or Before/After selector. Zoom, pan, drawing, tools, and expansion work as usual. Core and React both support this configuration; comparison plugins still require a pair.",
      },
    },
  },
  render: (args) => renderViewer(args, "single"),
};
export const TemporaryAnnotations: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Starts in Pen mode. Zoom into an area and draw a mark. Open Image tools to choose Rectangle, colors, Undo, and Clear; choosing a drawing mode closes the menu. Hold Space while dragging to pan. Switch Before/After to inspect each image independently.",
      },
    },
  },
  render: (args) => renderViewer(args, "drawing"),
};
export const Expanded: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Starts in the native modal lightbox. Escape or Close returns to the embedded viewer without losing marks. Tab stays within the dialog; closing restores focus.",
      },
    },
  },
  render: (args) => renderViewer(args, "expanded"),
};
export const SmallContainer: Story = {
  args: { width: "320px", height: "480px" },
  parameters: {
    docs: {
      description: {
        story:
          "A narrow viewer: compact controls overlay the image rather than reduce the viewport. Zooming increases only the internal scrollable image, never the viewer's configured height. Expand for more room. Touch supports pinch zoom and double-tap in Pan mode.",
      },
    },
  },
  render: (args) => renderViewer(args),
};

export const FixedBounds: Story = {
  args: { width: "320px", height: "200px" },
  parameters: {
    docs: {
      description: {
        story:
          "A deliberately short viewer. Zoom repeatedly or use original size from Image tools: the outer box stays 320 × 200, and panning is contained inside it. Opening the tools menu also leaves the viewport size unchanged.",
      },
    },
  },
  render: (args) => renderViewer(args),
};

export const ConsumerTheme: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Consumer CSS customizes controls, SVG icons, marks, and the dialog without !important. The theme is set on the viewer's ancestor and remains inherited in the native modal lightbox. Defaults use zero-specificity selectors; control classes can override layout and presentation directly.",
      },
    },
  },
  render: (args) => {
    const wrapper = renderViewer(args);
    wrapper.classList.add("lightbox-consumer-theme");
    const style = document.createElement("style");
    style.textContent = `
      .lightbox-consumer-theme {
        --diffopotamus-lightbox-background: #e2e8f0;
        --diffopotamus-lightbox-foreground: #0f172a;
        --diffopotamus-lightbox-chrome-background: #ffffff;
        --diffopotamus-lightbox-hover-background: #dbeafe;
        --diffopotamus-lightbox-active-background: #bfdbfe;
        --diffopotamus-lightbox-focus-color: #2563eb;
        --diffopotamus-lightbox-color-scheme: light;
        --diffopotamus-lightbox-control-size: 34px;
        --diffopotamus-lightbox-icon-size: 18px;
        --diffopotamus-lightbox-radius: 12px;
        --diffopotamus-lightbox-annotation-red: #9333ea;
        --diffopotamus-lightbox-annotation-width: 4;
      }
      .lightbox-consumer-theme .diffopotamus-lightbox-button { border-color: #cbd5e1; }
      .lightbox-consumer-theme .diffopotamus-lightbox-icon { stroke-width: 2; }
      .lightbox-consumer-theme .diffopotamus-lightbox-dialog::backdrop { background: rgb(15 23 42 / .6); }
    `;
    wrapper.append(style);
    return wrapper;
  },
};
