export type ImageSide = "before" | "after";
export type DrawingTool = "pan" | "pen" | "rectangle";

const SVG_NS = "http://www.w3.org/2000/svg";
const MAX_SCALE = 8;
interface PointerPosition {
  x: number;
  y: number;
  startX: number;
  startY: number;
  moved: boolean;
}
interface Stroke {
  element: SVGPolylineElement | SVGRectElement;
  pointerId: number;
  x: number;
  y: number;
  lastX: number;
  lastY: number;
}

/** Native scrolling owns positioning and bounds; SVG uses original image coordinates. */
export class InspectionViewport {
  readonly element = document.createElement("div");
  private readonly space = document.createElement("div");
  private readonly plane = document.createElement("div");
  private readonly image = document.createElement("img");
  private readonly svg = document.createElementNS(SVG_NS, "svg");
  private readonly groups = {
    before: document.createElementNS(SVG_NS, "g"),
    after: document.createElementNS(SVG_NS, "g"),
  };
  private readonly pointers = new Map<number, PointerPosition>();
  private readonly observer: ResizeObserver;
  private readonly events = new AbortController();
  private side: ImageSide = "after";
  private tool: DrawingTool = "pan";
  private color = "var(--diffopotamus-lightbox-annotation-red, #ff5252)";
  private spacePressed = false;
  private fitted = true;
  private width = 0;
  private height = 0;
  private imageWidth = 1;
  private imageHeight = 1;
  private scale = 1;
  private originX = 0;
  private originY = 0;
  private frame = 0;
  private stroke: Stroke | null = null;
  private pinching = false;
  private tapTime = 0;
  private tapX = 0;
  private tapY = 0;

  constructor(
    private readonly images: {
      before: HTMLImageElement | null;
      after: HTMLImageElement;
    },
    private readonly onChange: (scale: number, canUndo: boolean) => void,
  ) {
    this.element.className = "diffopotamus-lightbox-viewport";
    this.element.tabIndex = 0;
    this.element.setAttribute("role", "region");
    this.element.setAttribute(
      "aria-label",
      "Image inspection. Drag to pan; plus or minus to zoom, F to fit, 1 for original size.",
    );
    this.element.setAttribute("data-tool", this.tool);
    this.space.className = "diffopotamus-lightbox-space";
    this.plane.className = "diffopotamus-lightbox-plane";
    this.image.className = "diffopotamus-lightbox-image";
    this.svg.classList.add("diffopotamus-lightbox-annotations");
    for (const side of ["before", "after"] as const) {
      this.groups[side].classList.add(
        "diffopotamus-lightbox-marks",
        `diffopotamus-lightbox-marks-${side}`,
      );
    }
    this.image.draggable = false;
    this.svg.setAttribute("aria-hidden", "true");
    this.svg.append(this.groups.before, this.groups.after);
    this.plane.append(this.image, this.svg);
    this.space.append(this.plane);
    this.element.append(this.space);
    const options = { signal: this.events.signal };
    this.element.addEventListener("pointerdown", this.pointerDown, options);
    this.element.addEventListener("pointermove", this.pointerMove, options);
    this.element.addEventListener("pointerup", this.pointerEnd, options);
    this.element.addEventListener("pointercancel", this.pointerEnd, options);
    this.element.addEventListener(
      "lostpointercapture",
      this.pointerEnd,
      options,
    );
    this.element.addEventListener("wheel", this.wheel, {
      ...options,
      passive: false,
    });
    this.element.addEventListener("dblclick", this.doubleClick, options);
    window.addEventListener("blur", this.resetInteraction, options);
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(this.element);
    this.selectImage("after");
  }

  selectImage(side: ImageSide): void {
    const image = this.images[side];
    if (!image) throw new Error(`No ${side} image is loaded`);
    this.resetInteraction();
    this.tapTime = 0;
    this.side = side;
    this.image.src = image.src;
    this.image.alt = this.images.before
      ? `${side === "before" ? "Before" : "After"} image`
      : "Image";
    this.imageWidth = image.naturalWidth || image.width;
    this.imageHeight = image.naturalHeight || image.height;
    this.svg.setAttribute(
      "viewBox",
      `0 0 ${this.imageWidth} ${this.imageHeight}`,
    );
    this.groups.before.style.display = side === "before" ? "" : "none";
    this.groups.after.style.display = side === "after" ? "" : "none";
    this.fit();
  }

  setTool(tool: DrawingTool): void {
    this.resetInteraction();
    this.tool = tool;
    this.element.setAttribute("data-tool", tool);
  }

  setColor(color: string): void {
    this.color = color;
  }

  setSpace(pressed: boolean): void {
    if (pressed) this.cancelStroke();
    this.spacePressed = pressed;
    this.element.setAttribute("data-panning", String(pressed));
  }

  fit(): void {
    this.resetInteraction();
    this.fitted = true;
    this.setScale(this.fitScale());
    this.element.scrollTo(0, 0);
  }

  originalSize(): void {
    this.zoomAt(1, this.width / 2, this.height / 2);
  }
  zoom(factor: number): void {
    this.zoomAt(this.scale * factor, this.width / 2, this.height / 2);
  }
  pan(dx: number, dy: number): void {
    this.element.scrollBy(-dx, -dy);
  }

  undo(): void {
    this.cancelStroke();
    this.groups[this.side].lastElementChild?.remove();
    this.notify();
  }

  clear(): void {
    this.cancelStroke();
    this.groups[this.side].replaceChildren();
    this.notify();
  }

  cancelStroke(): void {
    this.stroke?.element.remove();
    this.stroke = null;
    this.notify();
  }

  destroy(): void {
    this.events.abort();
    this.observer.disconnect();
    this.resetInteraction();
    cancelAnimationFrame(this.frame);
    this.groups.before.replaceChildren();
    this.groups.after.replaceChildren();
    this.element.remove();
  }

  private fitScale(): number {
    return Math.min(
      this.width / this.imageWidth || 1,
      this.height / this.imageHeight || 1,
      1,
    );
  }

  private offsetX(): number {
    return Math.max(0, (this.width - this.imageWidth * this.scale) / 2);
  }
  private offsetY(): number {
    return Math.max(0, (this.height - this.imageHeight * this.scale) / 2);
  }
  private imageX(x: number): number {
    return (x + this.element.scrollLeft - this.offsetX()) / this.scale;
  }
  private imageY(y: number): number {
    return (y + this.element.scrollTop - this.offsetY()) / this.scale;
  }

  private readonly resize = (): void => {
    const width = this.element.clientWidth;
    const height = this.element.clientHeight;
    if (!width || !height) return;
    const x = this.imageX(this.width / 2);
    const y = this.imageY(this.height / 2);
    this.resetInteraction();
    this.width = width;
    this.height = height;
    if (this.fitted) this.fit();
    else {
      this.setScale(Math.max(this.fitScale(), this.scale));
      this.element.scrollTo(
        x * this.scale + this.offsetX() - width / 2,
        y * this.scale + this.offsetY() - height / 2,
      );
    }
  };

  private zoomAt(scale: number, x: number, y: number): void {
    const imageX = this.imageX(x);
    const imageY = this.imageY(y);
    this.fitted = false;
    this.setScale(Math.max(this.fitScale(), Math.min(MAX_SCALE, scale)));
    this.element.scrollTo(
      imageX * this.scale + this.offsetX() - x,
      imageY * this.scale + this.offsetY() - y,
    );
  }

  private setScale(scale: number): void {
    this.scale = scale;
    const width = `${this.imageWidth * scale}px`;
    const height = `${this.imageHeight * scale}px`;
    this.space.style.width = this.plane.style.width = width;
    this.space.style.height = this.plane.style.height = height;
    this.notify();
  }

  private notify(): void {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.onChange(this.scale, this.groups[this.side].childElementCount > 0);
    });
  }

  private updateOrigin(): void {
    const bounds = this.element.getBoundingClientRect();
    this.originX = bounds.left;
    this.originY = bounds.top;
  }

  private readonly wheel = (event: WheelEvent): void => {
    event.preventDefault();
    if (this.pointers.size) return;
    this.updateOrigin();
    const delta =
      event.deltaY *
      (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? this.height : 1);
    this.zoomAt(
      this.scale * Math.exp(-Math.max(-200, Math.min(200, delta)) * 0.002),
      event.clientX - this.originX,
      event.clientY - this.originY,
    );
  };

  private readonly doubleClick = (event: MouseEvent): void => {
    if (this.tool !== "pan" && !this.spacePressed) return;
    this.updateOrigin();
    this.toggleZoom(event.clientX - this.originX, event.clientY - this.originY);
  };

  private toggleZoom(x: number, y: number): void {
    if (this.scale > this.fitScale() * 1.01) this.fit();
    else this.zoomAt(Math.max(1, this.scale * 2), x, y);
  }

  private readonly pointerDown = (event: PointerEvent): void => {
    if (event.button !== 0 || this.pointers.size >= 2) return;
    event.preventDefault();
    this.element.focus({ preventScroll: true });
    this.updateOrigin();
    const x = event.clientX - this.originX;
    const y = event.clientY - this.originY;
    this.pointers.set(event.pointerId, {
      x,
      y,
      startX: x,
      startY: y,
      moved: false,
    });
    this.element.setPointerCapture(event.pointerId);
    if (this.pointers.size === 2) {
      this.pinching = true;
      this.tapTime = 0;
      this.cancelStroke();
    } else if (this.tool === "pan" || this.spacePressed) {
      this.element.setAttribute("data-panning", "true");
    } else this.startStroke(event.pointerId, x, y);
  };

  private readonly pointerMove = (event: PointerEvent): void => {
    const pointer = this.pointers.get(event.pointerId);
    if (!pointer) return;
    const x = event.clientX - this.originX;
    const y = event.clientY - this.originY;
    const dx = x - pointer.x;
    const dy = y - pointer.y;
    if (Math.hypot(x - pointer.startX, y - pointer.startY) > 3)
      pointer.moved = true;
    if (pointer.moved) this.tapTime = 0;
    if (this.pointers.size === 2) {
      const iterator = this.pointers.values();
      const first = iterator.next().value;
      const second = iterator.next().value;
      if (!first || !second) return;
      const centerX = (first.x + second.x) / 2;
      const centerY = (first.y + second.y) / 2;
      const distance = Math.hypot(first.x - second.x, first.y - second.y);
      pointer.x = x;
      pointer.y = y;
      if (distance > 0)
        this.zoomAt(
          (this.scale * Math.hypot(first.x - second.x, first.y - second.y)) /
            distance,
          centerX,
          centerY,
        );
      this.pan(
        (first.x + second.x) / 2 - centerX,
        (first.y + second.y) / 2 - centerY,
      );
    } else {
      pointer.x = x;
      pointer.y = y;
      if (this.stroke?.pointerId === event.pointerId) this.updateStroke(x, y);
      else if (this.tool === "pan" || this.spacePressed || this.pinching)
        this.pan(dx, dy);
    }
  };

  private startStroke(pointerId: number, x: number, y: number): void {
    const imageX = this.imageX(x);
    const imageY = this.imageY(y);
    if (
      imageX < 0 ||
      imageY < 0 ||
      imageX > this.imageWidth ||
      imageY > this.imageHeight
    )
      return;
    const element =
      this.tool === "pen"
        ? document.createElementNS(SVG_NS, "polyline")
        : document.createElementNS(SVG_NS, "rect");
    element.classList.add(
      "diffopotamus-lightbox-mark",
      `diffopotamus-lightbox-mark-${this.tool}`,
    );
    element.setAttribute("stroke", this.color);
    this.groups[this.side].append(element);
    this.stroke = {
      element,
      pointerId,
      x: imageX,
      y: imageY,
      lastX: Number.NaN,
      lastY: Number.NaN,
    };
    this.updateStroke(x, y);
  }

  private updateStroke(x: number, y: number): void {
    const stroke = this.stroke;
    if (!stroke) return;
    const imageX = Math.max(0, Math.min(this.imageWidth, this.imageX(x)));
    const imageY = Math.max(0, Math.min(this.imageHeight, this.imageY(y)));
    if (stroke.lastX === imageX && stroke.lastY === imageY) return;
    stroke.lastX = imageX;
    stroke.lastY = imageY;
    if (stroke.element instanceof SVGPolylineElement) {
      const point = this.svg.createSVGPoint();
      point.x = imageX;
      point.y = imageY;
      stroke.element.points.appendItem(point);
    } else {
      stroke.element.setAttribute("x", String(Math.min(stroke.x, imageX)));
      stroke.element.setAttribute("y", String(Math.min(stroke.y, imageY)));
      stroke.element.setAttribute("width", String(Math.abs(imageX - stroke.x)));
      stroke.element.setAttribute(
        "height",
        String(Math.abs(imageY - stroke.y)),
      );
    }
  }

  private readonly pointerEnd = (event: PointerEvent): void => {
    const pointer = this.pointers.get(event.pointerId);
    if (!pointer) return;
    const completed = event.type === "pointerup";
    if (!completed) this.tapTime = 0;
    if (this.stroke?.pointerId === event.pointerId) {
      if (completed && pointer.moved) {
        this.updateStroke(
          event.clientX - this.originX,
          event.clientY - this.originY,
        );
        this.stroke = null;
      } else this.cancelStroke();
    }
    this.pointers.delete(event.pointerId);
    if (this.element.hasPointerCapture(event.pointerId))
      this.element.releasePointerCapture(event.pointerId);
    if (
      completed &&
      event.pointerType === "touch" &&
      !pointer.moved &&
      !this.pinching &&
      this.tool === "pan"
    ) {
      const now = performance.now();
      if (
        this.tapTime > 0 &&
        now - this.tapTime < 300 &&
        Math.hypot(pointer.x - this.tapX, pointer.y - this.tapY) < 40
      ) {
        this.toggleZoom(pointer.x, pointer.y);
        this.tapTime = 0;
      } else {
        this.tapTime = now;
        this.tapX = pointer.x;
        this.tapY = pointer.y;
      }
    }
    if (!this.pointers.size) {
      this.pinching = false;
      this.element.setAttribute("data-panning", String(this.spacePressed));
    }
    this.notify();
  };

  private readonly resetInteraction = (): void => {
    this.cancelStroke();
    for (const id of this.pointers.keys()) {
      if (this.element.hasPointerCapture(id))
        this.element.releasePointerCapture(id);
    }
    this.pointers.clear();
    this.setSpace(false);
    this.pinching = false;
    this.tapTime = 0;
  };
}
