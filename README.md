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

```bash
# Install the magic
pnpm add @diffopotamus/core

# For React lovers
pnpm add @diffopotamus/react
```

```javascript
// Vanilla JS - Simple as a hippo's smile
import { Diffopotamus, SliderPlugin } from '@diffopotamus/core';

const differ = new Diffopotamus('#container', {
  beforeImage: 'before.jpg',
  afterImage: 'after.jpg',
  defaultPlugin: 'slider'
});

differ.registerPlugin('slider', SliderPlugin);
```

```jsx
// React - Because components are cool  
import { DiffopotamusReact } from '@diffopotamus/react';

function MyApp() {
  return (
    <DiffopotamusReact
      beforeImage="messy-room.jpg"
      afterImage="clean-room.jpg"
      plugin="slider"
      width="100%"
      height="400px"
    />
  );
}
```

## Features That'll Make You Go "WOW!" 🎉

- **TypeScript Support** - Because we're not animals (well, except for the hippo theme)
- **Zero Dependencies** - Lighter than a hippo on helium

## Plugin Ecosystem 🏗️

Create your own plugins! It's easier than teaching a hippo to dance:

```typescript
import { BasePlugin } from '@diffopotamus/core';

export class MyAwesomePlugin extends BasePlugin {
  render() {
    // Your creative genius goes here
    // Make those images dance!
  }
}
```

## Contributing 🤝

Found a bug? Want to add a feature? Think our hippo jokes need work? We'd love your help! Check out our [Contributing Guide](CONTRIBUTING.md) and join the herd.

## License 📄

Unlicense - Because sharing is caring, just like hippos sharing their watering holes.

---

**Made with 💜 and way too many hippo references**

*P.S. - No actual hippos were harmed in the making of this library. They were too busy being awesome.*

