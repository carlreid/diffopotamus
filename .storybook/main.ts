import type { StorybookConfig } from "@storybook/html-vite";

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/html-vite",
    options: {},
  },
  staticDirs: ["../stories/public"],
  typescript: {
    check: false,
  },
  viteFinal: async (config) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        "@diffopotamus/core": new URL(
          "../packages/core/dist/index.js",
          import.meta.url,
        ).pathname,
      },
    };
    return config;
  },
};
export default config;
