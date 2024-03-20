import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  entry: ["src/**/*.ts", "!src/**/*.proto"], // Include only TypeScript files
  format: ["cjs"],
  dts: true,
  shims: true,
  skipNodeModulesBundle: true,
  // publicDir: "src/utils/", // Include only proto files
});
