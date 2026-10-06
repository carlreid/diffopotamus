# @diffopotamus/react

React components and hooks for Diffopotamus - the adorable image comparison library! 🦛

## Installation

```bash
pnpm add @diffopotamus/core @diffopotamus/react
```

## Quick Start

The wrapper does not bundle or register built-in plugins and does not load CSS. Import each constructor and its stylesheet explicitly, then pass a stable `plugins` registry to the component or hook. Only registered plugins are selectable; `defaultPlugin` selects one of those names.

### Component (Simple)

```tsx
import { DiffopotamusViewer } from '@diffopotamus/react';
import { SliderPlugin } from '@diffopotamus/core/plugins/slider';
import '@diffopotamus/core/plugins/slider/styles.css';

const plugins = { slider: SliderPlugin };

function MyApp() {
  return (
    <DiffopotamusViewer
      beforeImage="/before.jpg"
      afterImage="/after.jpg"
      defaultPlugin="slider"
      plugins={plugins}
      width="600px"
      height="400px"
    />
  );
}
```

### Hook (Advanced Control)

```tsx
import { useRef } from 'react';
import { useDiffopotamus } from '@diffopotamus/react';
import { OverlayPlugin } from '@diffopotamus/core/plugins/overlay';
import '@diffopotamus/core/plugins/overlay/styles.css';

const plugins = { overlay: OverlayPlugin };

function MyApp() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    isLoading,
    error,
    activatePlugin,
    getAvailablePlugins,
  } = useDiffopotamus({
    containerRef,
    beforeImage: '/before.jpg',
    afterImage: '/after.jpg',
    defaultPlugin: 'overlay',
    plugins,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {getAvailablePlugins().map((plugin) => (
        <button key={plugin} onClick={() => activatePlugin(plugin)}>
          {plugin}
        </button>
      ))}
      
      <div ref={containerRef} style={{ width: '600px', height: '400px' }} />
    </div>
  );
}
```

## Image inspection with Lightbox

Zoom, pan, and temporarily mark an image. Opt into Lightbox explicitly; use only `afterImage` for a single image, or add `beforeImage` for a pair.

```tsx
import { DiffopotamusViewer } from '@diffopotamus/react';
import { LightboxPlugin } from '@diffopotamus/core/plugins/lightbox';
import '@diffopotamus/core/plugins/lightbox/styles.css';

const plugins = { lightbox: LightboxPlugin };

function ImageInspector() {
  return <DiffopotamusViewer afterImage="/image.png" plugins={plugins} defaultPlugin="lightbox" />;
}
```

Customize controls with `diffopotamus-lightbox-*` CSS classes and theme variables. See Storybook's Single Image and Consumer Theme examples for more.

Side by Side is available from `@diffopotamus/core/plugins/side-by-side` with its `styles.css` subpath. Registry keys are consumer-selected names (for example `sideBySide`). The hook also retains `registerPlugin(name, Constructor)` for manual registration after initialization; load that plugin's CSS yourself.

Default styles live in `@layer diffopotamus`, so ordinary unlayered consumer CSS can override stable `diffopotamus-*` class hooks without `!important`. Common tokens are `--diffopotamus-accent`, `--diffopotamus-control-background`, `--diffopotamus-control-radius`, and `--diffopotamus-font`; Lightbox additionally provides its own theme variables.

