import { readFileSync } from "node:fs";
import wyw from "@wyw-in-js/esbuild";
import { build } from "esbuild";

const packageJson = JSON.parse(readFileSync("./package.json", "utf8"));

const baseOptions = {
  external: Object.keys(packageJson.peerDependencies || {}),
  sourcemap: true,
  target: "es2020", // Node 16+ compatibility
  platform: "neutral",
  plugins: [
    wyw({
      filter: /\.(js|jsx|ts|tsx)$/,
      sourceMap: true,
    }),
  ],
};

// ESM build - unbundled for tree shaking
await build({
  ...baseOptions,
  entryPoints: ["src/index.ts"],
  format: "esm",
  outdir: "dist/esm",
  bundle: false,
  outExtension: { ".js": ".js" },
});

// ESM bundled build for direct usage
await build({
  ...baseOptions,
  entryPoints: ["src/index.ts"],
  format: "esm",
  bundle: true,
  outdir: "dist/esm",
  outExtension: { ".js": ".bundle.js" },
  minify: false,
});

// ESM bundled minified build
await build({
  ...baseOptions,
  entryPoints: ["src/index.ts"],
  format: "esm",
  bundle: true,
  outdir: "dist/esm",
  outExtension: { ".js": ".bundle.min.js" },
  minify: true,
  sourcemap: "external",
});

// CommonJS build - bundled for compatibility
await build({
  ...baseOptions,
  entryPoints: ["src/index.ts"],
  format: "cjs",
  bundle: true,
  outdir: "dist/cjs",
  outExtension: { ".js": ".cjs" },
  minify: false,
});

// CommonJS minified build
await build({
  ...baseOptions,
  entryPoints: ["src/index.ts"],
  format: "cjs",
  bundle: true,
  outdir: "dist/cjs",
  outExtension: { ".js": ".min.cjs" },
  minify: true,
  sourcemap: "external",
});

console.log("✅ Core package built successfully!");
console.log("🎨 CSS extracted and processed by Linaria");
