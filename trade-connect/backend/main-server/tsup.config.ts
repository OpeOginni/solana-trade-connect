import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  entry: ["src/**", "!src/**/__tests__/**", "!src/**/*.test.*"],
  format: ["cjs"],
  shims: true,
  skipNodeModulesBundle: true,
  external: ["../../grpc/dist", "../../../grpc/dist", "../../grpc/dist/proto/chat_main/TradeService"],
});
