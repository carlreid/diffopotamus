const paths = {
  tools: "M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M10 15v6",
  zoomIn: "M5 12h14M12 5v14",
  zoomOut: "M5 12h14",
  fit: "M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5M8 8h8v8H8z",
  original: "M6 6v12M4 8l2-2M16 6v12M14 8l2-2M11 9v1m0 4v1",
  pan: "M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3",
  pen: "M4 20l4-1L20 7l-3-3L5 16l-1 4zM14 7l3 3",
  rectangle: "M4 5h16v14H4z",
  undo: "M9 5l-5 5 5 5M4 10h10a6 6 0 0 1 6 6v3",
  clear: "M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7",
  expand: "M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5",
  close: "M5 5l14 14M19 5L5 19",
} as const;

export type IconName = keyof typeof paths;

export function createIcon(name: IconName): SVGSVGElement {
  const ns = "http://www.w3.org/2000/svg";
  const icon = document.createElementNS(ns, "svg");
  icon.classList.add("diffopotamus-lightbox-icon");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  icon.setAttribute("focusable", "false");
  const path = document.createElementNS(ns, "path");
  path.setAttribute("d", paths[name]);
  icon.append(path);
  return icon;
}
