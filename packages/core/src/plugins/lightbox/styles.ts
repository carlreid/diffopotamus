const STYLE_ID = "diffopotamus-lightbox-styles";

export function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  // Zero specificity lets consumer styles win regardless of injection order.
  style.textContent = `
:where(.diffopotamus-lightbox) {
  position: absolute; inset: 0; display: grid; min-width: 0; min-height: 0;
  overflow: hidden; contain: size layout; isolation: isolate;
  background: var(--diffopotamus-lightbox-background, #141923);
  color: var(--diffopotamus-lightbox-foreground, #f3f4f6);
  font: var(--diffopotamus-lightbox-font, 12px/1.4 system-ui, sans-serif);
  color-scheme: var(--diffopotamus-lightbox-color-scheme, dark);
}
:where(.diffopotamus-lightbox, .diffopotamus-lightbox *) { box-sizing: border-box; }
:where(.diffopotamus-lightbox-toolbar) {
  display: flex; align-items: center; gap: var(--diffopotamus-lightbox-gap, 4px);
  align-self: start; justify-self: start; z-index: 1;
  margin: var(--diffopotamus-lightbox-offset, 8px);
  max-width: calc(100% - 2 * var(--diffopotamus-lightbox-offset, 8px));
  padding: var(--diffopotamus-lightbox-chrome-padding, 4px);
  background: var(--diffopotamus-lightbox-chrome-background, rgb(32 39 53 / .94));
  border-radius: var(--diffopotamus-lightbox-radius, 6px);
  box-shadow: var(--diffopotamus-lightbox-shadow, 0 2px 8px rgb(0 0 0 / .25));
}
:where(.diffopotamus-lightbox-button, .diffopotamus-lightbox-source, .diffopotamus-lightbox-color) {
  display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto;
  font: inherit; color: inherit; cursor: pointer;
  height: var(--diffopotamus-lightbox-control-size, 30px);
  padding: var(--diffopotamus-lightbox-control-padding, 4px);
  background: var(--diffopotamus-lightbox-control-background, transparent);
  border: 1px solid var(--diffopotamus-lightbox-border, transparent);
  border-radius: var(--diffopotamus-lightbox-radius, 6px);
}
:where(.diffopotamus-lightbox-button) { width: var(--diffopotamus-lightbox-control-size, 30px); }
:where(.diffopotamus-lightbox-button:hover:not(:disabled)) {
  background: var(--diffopotamus-lightbox-hover-background, #42516a);
}
:where(.diffopotamus-lightbox-button[aria-pressed="true"], .diffopotamus-lightbox-tools[open] > summary) {
  background: var(--diffopotamus-lightbox-active-background, #245a8c);
}
:where(.diffopotamus-lightbox-button:disabled) { opacity: .4; cursor: default; }
:where(.diffopotamus-lightbox :focus-visible) {
  outline: 2px solid var(--diffopotamus-lightbox-focus-color, #a5d6ff); outline-offset: 2px;
}
:where(.diffopotamus-lightbox-zoom) { width: auto; min-width: 5ch; font-variant-numeric: tabular-nums; }
:where(.diffopotamus-lightbox-icon) {
  width: var(--diffopotamus-lightbox-icon-size, 16px); height: var(--diffopotamus-lightbox-icon-size, 16px);
  fill: none; stroke: currentColor; stroke-width: var(--diffopotamus-lightbox-icon-stroke-width, 1.75);
  stroke-linecap: round; stroke-linejoin: round; pointer-events: none;
}
:where(.diffopotamus-lightbox-tools-toggle) { list-style: none; }
:where(.diffopotamus-lightbox-tools-toggle)::-webkit-details-marker { display: none; }
:where(.diffopotamus-lightbox-tools-panel) {
  position: absolute; left: var(--diffopotamus-lightbox-offset, 8px);
  top: calc(var(--diffopotamus-lightbox-offset, 8px) + var(--diffopotamus-lightbox-control-size, 30px) + 2 * var(--diffopotamus-lightbox-chrome-padding, 4px) + 8px);
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--diffopotamus-lightbox-gap, 4px);
  width: calc(4 * var(--diffopotamus-lightbox-control-size, 30px) + 3 * var(--diffopotamus-lightbox-gap, 4px) + 2 * var(--diffopotamus-lightbox-panel-padding, 6px));
  max-width: calc(100% - 2 * var(--diffopotamus-lightbox-offset, 8px));
  max-height: calc(100% - 2 * var(--diffopotamus-lightbox-offset, 8px) - var(--diffopotamus-lightbox-control-size, 30px) - 2 * var(--diffopotamus-lightbox-chrome-padding, 4px) - 8px);
  overflow: auto; overscroll-behavior: contain; padding: var(--diffopotamus-lightbox-panel-padding, 6px);
  background: var(--diffopotamus-lightbox-chrome-background, rgb(32 39 53 / .94));
  border-radius: var(--diffopotamus-lightbox-radius, 6px);
  box-shadow: var(--diffopotamus-lightbox-shadow, 0 2px 8px rgb(0 0 0 / .25));
}
:where(.diffopotamus-lightbox-color) { grid-column: span 2; min-width: 0; width: 100%; }
:where(.diffopotamus-lightbox-viewport) {
  position: absolute; inset: 0; min-width: 0; min-height: 0; overflow: auto;
  touch-action: none; overscroll-behavior: contain; scrollbar-width: none; scroll-behavior: auto;
  user-select: none; cursor: grab; overflow-anchor: none;
  background: var(--diffopotamus-lightbox-background, #141923);
}
:where(.diffopotamus-lightbox-viewport[data-tool="pen"], .diffopotamus-lightbox-viewport[data-tool="rectangle"]) { cursor: crosshair; }
:where(.diffopotamus-lightbox-viewport[data-panning="true"]) { cursor: grabbing; }
:where(.diffopotamus-lightbox-space) { display: grid; place-items: center; min-width: 100%; min-height: 100%; }
:where(.diffopotamus-lightbox-plane) { position: relative; }
:where(.diffopotamus-lightbox-image) { display: block; width: 100%; height: 100%; max-width: none; pointer-events: none; }
:where(.diffopotamus-lightbox-annotations) { position: absolute; inset: 0; width: 100%; height: 100%; overflow: hidden; pointer-events: none; }
:where(.diffopotamus-lightbox-mark) {
  fill: none; stroke-width: var(--diffopotamus-lightbox-annotation-width, 3);
  vector-effect: non-scaling-stroke; stroke-linecap: round; stroke-linejoin: round;
}
:where(.diffopotamus-lightbox-dialog) {
  position: fixed; inset: 0; width: 100%; height: 100%; max-width: none; max-height: none;
  margin: 0; padding: 0; border: 0; overscroll-behavior: contain;
  background: var(--diffopotamus-lightbox-background, #141923);
}
:where(.diffopotamus-lightbox-dialog)::backdrop { background: var(--diffopotamus-lightbox-backdrop, rgb(0 0 0 / .85)); }
`;
  document.head.appendChild(style);
}
