import { css } from "@linaria/core";

// Side-by-Side Plugin Styles
export const sideBySideStyles = css`
  .diffopotamus-side-by-side {
    display: flex;
    gap: 2px;
    width: 100%;
    height: 100%;
  }

  .diffopotamus-side-by-side--vertical {
    flex-direction: column;
  }

  .diffopotamus-side-by-side--horizontal {
    flex-direction: row;
  }

  .diffopotamus-side-by-side-container {
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  .diffopotamus-side-by-side-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .diffopotamus-side-by-side-label {
    position: absolute;
    top: 10px;
    left: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
    z-index: 5;
    user-select: none;
    font-weight: 500;
  }

  .diffopotamus-side-by-side-label--top-right {
    top: 10px;
    right: 10px;
    left: auto;
  }

  .diffopotamus-side-by-side-label--bottom-left {
    bottom: 10px;
    top: auto;
    left: 10px;
  }

  .diffopotamus-side-by-side-label--bottom-right {
    bottom: 10px;
    right: 10px;
    top: auto;
    left: auto;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .diffopotamus-side-by-side {
      flex-direction: column;
      gap: 1px;
    }

    .diffopotamus-side-by-side-label {
      font-size: 12px;
      padding: 3px 6px;
    }
  }
`;
