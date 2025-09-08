# Diffopotamus - Image Diff-ing 🦛

Diffopotamus is a powerful, yet surprisingly adorable, image comparison library that helps you spot the differences between two images with the precision of a pixel-peeping hippo! Whether you're a developer, a designer, or just someone who loves a good "before and after," Diffopotamus has got your back (and your pixels!).

## Why Diffopotamus? 🤔

Because regular image comparison tools are about as exciting as watching paint dry on a rainy Tuesday. We decided to make something that's actually fun to use!

**🌈 Framework-Agnostic Magic**
Like a chameleon hippo (yes, that's a thing now), Diffopotamus blends seamlessly into any environment. Use it in plain JavaScript, React, Vite, or whatever flavor of frontend framework tickles your fancy. No framework FOMO here!

**🔌 Plugin-Powered Awesomeness**
Our modular design means you can swap out comparison methods faster than a hippo can chomp a watermelon. Think of plugins as different lenses for your visual detective work:
- **Side by Side** - Classic split-screen action
- **Overlay with Slider** - Swipe to reveal like a magic trick
- **Overlay Blending** - Fade between images like a smooth operator

**🎯 Easy as Pie (Hippo Pie?)**
We believe comparing images should be fun, not a chore that makes you want to hibernate. Our API is as friendly as a baby hippo, making integration smoother than a hippo sliding into water.

## Quick Start 🚀

### For Vanilla JavaScript/TypeScript Projects

```bash
pnpm add @diffopotamus/core
```

```javascript
import { Diffopotamus, SliderPlugin, OverlayPlugin, SideBySidePlugin } from '@diffopotamus/core';

const container = document.getElementById('diff-container');
const differ = new Diffopotamus(container, {
  beforeImage: '/path/to/before.jpg',
  afterImage: '/path/to/after.jpg',
  width: '100%',
  height: '400px'
});

// Register the plugins you want to use
differ.registerPlugin('slider', SliderPlugin);
differ.registerPlugin('overlay', OverlayPlugin);
differ.registerPlugin('sideBySide', SideBySidePlugin);

// Activate your preferred plugin
await differ.activatePlugin('slider');
```

### For React Projects

```bash
pnpm add @diffopotamus/react
```

#### Component Approach

```jsx
import { DiffopotamusViewer } from '@diffopotamus/react';

function MyApp() {
  return (
    <DiffopotamusViewer
      beforeImage="/messy-room.jpg"
      afterImage="/clean-room.jpg"
      defaultPlugin="slider"
      width="100%"
      height="400px"
      onPluginChange={(plugin) => console.log('Switched to:', plugin)}
      onReady={(instance) => console.log('Ready to compare!')}
    />
  );
}
```

#### Hook Approach

```jsx
import { useRef } from 'react';
import { useDiffopotamus } from '@diffopotamus/react';

function MyApp() {
  const containerRef = useRef(null);
  
  const {
    instance,
    isLoading,
    isReady,
    activatePlugin,
    getAvailablePlugins
  } = useDiffopotamus({
    containerRef,
    beforeImage: '/messy-room.jpg',
    afterImage: '/clean-room.jpg',
    defaultPlugin: 'overlay',
    width: '600px',
    height: '400px'
  });

  if (isLoading) return <div>Loading images...</div>;

  return (
    <div>
      <div>
        {getAvailablePlugins().map(plugin => (
          <button 
            key={plugin}
            onClick={() => activatePlugin(plugin)}
            disabled={!isReady}
          >
            {plugin}
          </button>
        ))}
      </div>
      
      <div 
        ref={containerRef} 
        style={{ width: '600px', height: '400px' }}
      />
    </div>
  );
}
```

## Plugin Ecosystem 🏗️

Diffopotamus comes with built-in plugins, and creating custom ones is easier than teaching a hippo to dance:

### Built-in Plugins

#### Slider
Perfect for dramatic reveals! Drag a slider to reveal the differences.

```javascript
// Core usage
import { SliderPlugin } from '@diffopotamus/core';
differ.registerPlugin('slider', SliderPlugin);
await differ.activatePlugin('slider');

// React usage - automatically available!
<DiffopotamusViewer defaultPlugin="slider" />
```

#### Overlay
Blend images with different modes like a photo editing pro.

```javascript
// Core usage  
import { OverlayPlugin } from '@diffopotamus/core';
differ.registerPlugin('overlay', OverlayPlugin);
await differ.activatePlugin('overlay');

// React usage - automatically available!
<DiffopotamusViewer defaultPlugin="overlay" />
```

#### Side-by-Side
Classic split-screen comparison - old school but gold school!

```javascript
// Core usage
import { SideBySidePlugin } from '@diffopotamus/core';
differ.registerPlugin('sideBySide', SideBySidePlugin);
await differ.activatePlugin('sideBySide');

// React usage - automatically available!
<DiffopotamusViewer defaultPlugin="sideBySide" />
```

### Creating Custom Plugins

```typescript
import { BasePlugin } from '@diffopotamus/core';

export class MyAwesomePlugin extends BasePlugin {
  render() {
    // Insert your creative genius
    // Access this.beforeImage, this.afterImage, this.container
    // ...
    // Consider contributing the plugin to Diffopotamus
    
    const beforeImg = document.createElement('img');
    beforeImg.src = this.beforeImage.src;
    beforeImg.style.opacity = '0.5';
    
    const afterImg = document.createElement('img');
    afterImg.src = this.afterImage.src;
    afterImg.style.opacity = '0.5';
    
    this.container.appendChild(beforeImg);
    this.container.appendChild(afterImg);
  }
  
  destroy() {
    // Clean up your mess when the plugin is deactivated
    this.container.innerHTML = '';
  }
}

// Register and use your plugin
differ.registerPlugin('myAwesome', MyAwesomePlugin);
await differ.activatePlugin('myAwesome');
```

## Advanced Examples 🎯

### Dynamic Image Switching

```javascript
// Core - Switch images on the fly
const differ = new Diffopotamus(container, {
  beforeImage: '/image1-before.jpg',
  afterImage: '/image1-after.jpg'
});

// Later... 
await differ.updateImages('/image2-before.jpg', '/image2-after.jpg');
```

```jsx
// React Hook - With loading states
const { updateImages, isLoading } = useDiffopotamus({
  containerRef,
  beforeImage: currentImages.before,
  afterImage: currentImages.after
});

const switchImageSet = async () => {
  await updateImages(newImages.before, newImages.after);
};
```

### Error Handling

```javascript
// Core
const differ = new Diffopotamus(container, {
  beforeImage: '/before.jpg',
  afterImage: '/after.jpg',
  onError: (error) => {
    console.error('Image loading failed:', error);
  }
});
```

```jsx
// React
const { error, isLoading, isReady } = useDiffopotamus({
  // ... config
});

if (error) return <div>Error: {error.message}</div>;
if (isLoading) return <div>Loading images...</div>;
if (!isReady) return <div>Initializing...</div>;
```

### Plugin Switching

```javascript
// Core
await differ.activatePlugin('overlay');
```

```jsx
// React
const { activatePlugin, getCurrentPlugin, getAvailablePlugins } = useDiffopotamus({
  // ... config
});

return (
  <div>
    {getAvailablePlugins().map(plugin => (
      <button
        key={plugin}
        onClick={() => activatePlugin(plugin)}
        className={getCurrentPlugin() === plugin ? 'active' : ''}
      >
        {plugin}
      </button>
    ))}
  </div>
);
```

## Package Structure 📦

Diffopotamus is organized as a monorepo with focused packages:

- **[@diffopotamus/core](./packages/core)** - The main engine, framework-agnostic
- **[@diffopotamus/react](./packages/react)** - React component and hook

Choose the package that fits your project:
- Building a React app? → `@diffopotamus/react`
- Using Vue, Svelte, or vanilla JS? → `@diffopotamus/core`

## Contributing 🤝

Found a bug? Want to add a feature? Think our hippo jokes need work? We'd love your help! Check out our [Contributing Guide](CONTRIBUTING.md) and join the herd.

## License 📄

Unlicense - Because sharing is caring, just like hippos sharing their watering holes.

---

**Made with 💜 and way too many hippo references**

*P.S. - No actual hippos were harmed in the making of this library. They were too busy being awesome.*

