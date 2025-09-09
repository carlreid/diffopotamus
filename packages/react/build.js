import { readFileSync } from "node:fs";
import { build } from "esbuild";

const packageJson = JSON.parse(readFileSync("./package.json", "utf8"));

const externalDependencies = [
  "react",
  "react-dom",
  ...Object.keys(packageJson.dependencies || {}),
];

const baseOptions = {
  sourcemap: true,
  target: "es2020", // Node 16+ compatibility
  platform: "neutral",
};

// ESM build - unbundled for tree shaking
await build({
  ...baseOptions,
  entryPoints: ["src/index.ts"],
  format: "esm",
  outdir: "dist/esm",
  splitting: true,
  bundle: false,
  outExtension: { ".js": ".js" },
});

// ESM bundled build for direct usage
await build({
  ...baseOptions,
  external: externalDependencies,
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
  external: externalDependencies,
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
  external: externalDependencies,
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
  external: externalDependencies,
  entryPoints: ["src/index.ts"],
  format: "cjs",
  bundle: true,
  outdir: "dist/cjs",
  outExtension: { ".js": ".min.cjs" },
  minify: true,
  sourcemap: "external",
});

console.log("✅ React package built successfully!");
