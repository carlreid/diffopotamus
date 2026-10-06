import { BasePlugin } from "../../types/index.js";
import { createIcon, type IconName } from "./icons.js";
import { injectStyles } from "./styles.js";
import {
  type DrawingTool,
  type ImageSide,
  InspectionViewport,
} from "./viewport.js";

/** Single-image inspection with ephemeral, image-coordinate annotations. */
export class LightboxPlugin extends BasePlugin {
  static override readonly requiresImagePair: boolean = false;
  private root: HTMLElement | null = null;
  private viewport: InspectionViewport | null = null;
  private dialog: HTMLDialogElement | null = null;
  private events: AbortController | null = null;
  private restoreFocus: HTMLElement | null = null;

  render(): void {
    injectStyles();
    this.events = new AbortController();
    const options = { signal: this.events.signal };
    const root = document.createElement("div");
    root.className = "diffopotamus-plugin diffopotamus-lightbox";
    this.root = root;
    const toolbar = document.createElement("div");
    toolbar.className = "diffopotamus-lightbox-toolbar";
    toolbar.setAttribute("role", "group");
    toolbar.setAttribute("aria-label", "Image inspection controls");
    const button = (
      parent: HTMLElement,
      name: string,
      title: string,
      action: () => void,
      icon?: IconName,
    ): HTMLButtonElement => {
      const element = document.createElement("button");
      element.type = "button";
      element.className = `diffopotamus-lightbox-button diffopotamus-lightbox-${name}`;
      if (icon) element.append(createIcon(icon));
      element.title = title;
      element.setAttribute("aria-label", title);
      element.addEventListener("click", action, options);
      parent.append(element);
      return element;
    };
    if (this.config.beforeImage) {
      const source = document.createElement("select");
      source.className = "diffopotamus-lightbox-source";
      source.setAttribute("aria-label", "Image to inspect");
      source.add(new Option("Before", "before"));
      source.add(new Option("After", "after"));
      source.value = "after";
      source.addEventListener(
        "change",
        () => {
          this.viewport?.selectImage(source.value as ImageSide);
          tools.open = false;
        },
        options,
      );
      toolbar.append(source);
    }
    const zoom = button(toolbar, "zoom", "Fit image (F)", () =>
      this.viewport?.fit(),
    );
    const zoomLabel = document.createElement("span");
    zoomLabel.className = "diffopotamus-lightbox-zoom-label";
    zoom.append(zoomLabel);
    const tools = document.createElement("details");
    tools.className = "diffopotamus-lightbox-tools";
    const toggle = document.createElement("summary");
    toggle.className =
      "diffopotamus-lightbox-button diffopotamus-lightbox-tools-toggle";
    toggle.setAttribute("aria-label", "Image tools");
    toggle.title = "Image tools";
    toggle.append(createIcon("tools"));
    const panel = document.createElement("div");
    panel.className = "diffopotamus-lightbox-tools-panel";
    panel.setAttribute("role", "group");
    panel.setAttribute("aria-label", "Zoom and annotation tools");
    tools.append(toggle, panel);
    toolbar.append(tools);
    button(
      panel,
      "zoom-out",
      "Zoom out (minus)",
      () => this.viewport?.zoom(1 / 1.25),
      "zoomOut",
    );
    const zoomIn = button(
      panel,
      "zoom-in",
      "Zoom in (plus)",
      () => this.viewport?.zoom(1.25),
      "zoomIn",
    );
    button(panel, "fit", "Fit image (F)", () => this.viewport?.fit(), "fit");
    button(
      panel,
      "original",
      "Original image size (1)",
      () => this.viewport?.originalSize(),
      "original",
    );
    const toolButtons = new Map<DrawingTool, HTMLButtonElement>();
    const chooseTool = (tool: DrawingTool): void => {
      this.viewport?.setTool(tool);
      for (const [name, element] of toolButtons)
        element.setAttribute("aria-pressed", String(name === tool));
      toggle.replaceChildren(createIcon(tool === "pan" ? "tools" : tool));
      toggle.title =
        tool === "pan" ? "Image tools" : `Image tools (${tool} active)`;
      tools.open = false;
      this.viewport?.element.focus({ preventScroll: true });
    };
    for (const tool of ["pan", "pen", "rectangle"] as const) {
      const element = button(
        panel,
        `tool-${tool}`,
        tool === "pan" ? "Pan image" : `Draw with ${tool}`,
        () => chooseTool(tool),
        tool,
      );
      element.setAttribute("aria-pressed", String(tool === "pan"));
      toolButtons.set(tool, element);
    }
    const color = document.createElement("select");
    color.className = "diffopotamus-lightbox-color";
    color.setAttribute("aria-label", "Annotation color");
    for (const [name, value] of [
      ["Red", "var(--diffopotamus-lightbox-annotation-red, #ff5252)"],
      ["Yellow", "var(--diffopotamus-lightbox-annotation-yellow, #ffeb3b)"],
      ["Cyan", "var(--diffopotamus-lightbox-annotation-cyan, #00e5ff)"],
      ["White", "var(--diffopotamus-lightbox-annotation-white, #ffffff)"],
    ] as const)
      color.add(new Option(name, value));
    color.addEventListener(
      "change",
      () => this.viewport?.setColor(color.value),
      options,
    );
    panel.append(color);
    const undo = button(
      panel,
      "undo",
      "Undo last annotation (Control or Command + Z)",
      () => this.viewport?.undo(),
      "undo",
    );
    const clear = button(
      panel,
      "clear",
      "Clear annotations on this image",
      () => this.viewport?.clear(),
      "clear",
    );
    undo.disabled = true;
    clear.disabled = true;
    const expand = button(
      toolbar,
      "expand",
      "Expand image inspection",
      () => {
        tools.open = false;
        if (this.dialog?.open) this.dialog.close();
        else if (this.dialog) {
          this.restoreFocus =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
          this.dialog.append(root);
          this.dialog.showModal();
          expand.replaceChildren(createIcon("close"));
          expand.setAttribute(
            "aria-label",
            "Close expanded inspection (Escape)",
          );
          expand.title = "Close expanded inspection (Escape)";
          this.viewport?.element.focus({ preventScroll: true });
        }
      },
      "expand",
    );
    expand.setAttribute("aria-haspopup", "dialog");
    this.viewport = new InspectionViewport(
      { before: this.config.beforeImage, after: this.afterImage },
      (scale, canUndo) => {
        zoomLabel.textContent = `${Math.round(scale * 100)}%`;
        zoom.setAttribute(
          "aria-label",
          `Zoom ${zoomLabel.textContent}. Fit image (F)`,
        );
        zoomIn.disabled = scale >= 8;
        undo.disabled = !canUndo;
        clear.disabled = !canUndo;
      },
    );
    this.viewport.element.addEventListener(
      "pointerdown",
      () => {
        tools.open = false;
      },
      options,
    );
    root.append(this.viewport.element, toolbar);
    this.container.append(root);
    const dialog = document.createElement("dialog");
    dialog.className = "diffopotamus-lightbox-dialog";
    dialog.setAttribute("aria-label", "Expanded image inspection");
    this.dialog = dialog;
    this.container.append(dialog);
    dialog.addEventListener(
      "close",
      () => {
        this.container.append(root);
        expand.replaceChildren(createIcon("expand"));
        expand.setAttribute("aria-label", "Expand image inspection");
        expand.title = "Expand image inspection";
        if (this.restoreFocus?.isConnected)
          this.restoreFocus.focus({ preventScroll: true });
        this.restoreFocus = null;
      },
      options,
    );
    root.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape" && tools.open) {
          event.preventDefault();
          tools.open = false;
          toggle.focus({ preventScroll: true });
        }
      },
      options,
    );
    root.addEventListener("keydown", this.keyDown, options);
    window.addEventListener("keyup", this.keyUp, options);
  }

  destroy(): void {
    this.events?.abort();
    this.viewport?.destroy();
    if (this.dialog?.open) this.dialog.close();
    this.dialog?.remove();
    this.root?.remove();
    this.root = null;
    this.viewport = null;
    this.dialog = null;
    this.events = null;
    this.restoreFocus = null;
  }

  private readonly keyDown = (event: KeyboardEvent): void => {
    if (!this.viewport || event.target instanceof HTMLSelectElement) return;
    if (event.key === " " && event.target === this.viewport.element) {
      event.preventDefault();
      this.viewport.setSpace(true);
      return;
    }
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "z" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      this.viewport.undo();
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    switch (event.key.toLowerCase()) {
      case "+":
      case "=":
        this.viewport.zoom(1.25);
        break;
      case "-":
        this.viewport.zoom(1 / 1.25);
        break;
      case "f":
        this.viewport.fit();
        break;
      case "1":
        this.viewport.originalSize();
        break;
      case "arrowleft":
        this.viewport.pan(40, 0);
        break;
      case "arrowright":
        this.viewport.pan(-40, 0);
        break;
      case "arrowup":
        this.viewport.pan(0, 40);
        break;
      case "arrowdown":
        this.viewport.pan(0, -40);
        break;
      case "escape":
        this.viewport.cancelStroke();
        return;
      default:
        return;
    }
    event.preventDefault();
  };

  private readonly keyUp = (event: KeyboardEvent): void => {
    if (event.key === " ") this.viewport?.setSpace(false);
  };
}
