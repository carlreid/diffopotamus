# @diffopotamus/react

React components and hooks for Diffopotamus - the adorable image comparison library! 🦛

## Installation

```bash
pnpm add @diffopotamus/react
```

## Quick Start

### Component (Simple)

```tsx
import { DiffopotamusViewer } from '@diffopotamus/react';

function MyApp() {
  return (
    <DiffopotamusViewer
      beforeImage="/before.jpg"
      afterImage="/after.jpg"
      defaultPlugin="slider"
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