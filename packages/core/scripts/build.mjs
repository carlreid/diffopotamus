import { spawn } from "node:child_process";
import { copyFileSync, mkdirSync, rmSync, watch, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const dist = new URL("dist/", root);
const watchMode = process.argv.includes("--watch");
const plugins = ["slider", "overlay", "side-by-side", "lightbox"];
const watchers = [];

rmSync(dist, { recursive: true, force: true });
for (const plugin of plugins) {
  const source = new URL(`src/plugins/${plugin}/`, root);
  const destination = new URL(`plugins/${plugin}/`, dist);
  mkdirSync(destination, { recursive: true });
  const copyStyle = () =>
    copyFileSync(
      new URL("styles.css", source),
      new URL("styles.css", destination),
    );
  copyStyle();
  writeFileSync(new URL("styles.css.d.ts", destination), "export {};\n");
  if (watchMode) {
    watchers.push(
      watch(source, (_event, filename) => {
        if (filename === "styles.css") copyStyle();
      }),
    );
  }
}

const compiler = spawn(
  process.execPath,
  [
    fileURLToPath(
      new URL("lib/tsc.js", import.meta.resolve("typescript/package.json")),
    ),
    ...(watchMode ? ["--watch"] : []),
  ],
  { cwd: fileURLToPath(root), stdio: "inherit" },
);

const closeWatchers = () => {
  for (const watcher of watchers) watcher.close();
};
compiler.on("error", (error) => {
  closeWatchers();
  console.error(error);
  process.exitCode = 1;
});
compiler.on("exit", (code) => {
  closeWatchers();
  process.exitCode = code ?? 1;
});
process.once("SIGINT", () => compiler.kill("SIGINT"));
process.once("SIGTERM", () => compiler.kill("SIGTERM"));
