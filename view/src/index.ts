import { createApp } from "vue";
import { PreviewService } from "./services/preview-service";

import AppView from "./app.vue";
import { RPCService } from "./services/rpc-service";

async function initialize() {
  const app = createApp(AppView);

  // ============================================================
  // 1. Initilize the RPC service for current process
  const rpcService = new RPCService();
  // ============================================================
  // 2. Start the port exchange process.
  await rpcService.initCommunication();

  // ============================================================
  // 3. Wait for the main process to expose its APIs (PLMainAPI)
  const mainAPIExposed = await rpcService.waitForAPI(
    "mainProcess",
    "PLMainAPI",
    5000
  );

  if (!mainAPIExposed) {
    throw new Error("Main process API is not exposed");
  }

  // 4. Wait for the renderer process to expose its APIs (PLRendererAPI)
  const rendererAPIExposed = await rpcService.waitForAPI(
    "rendererProcess",
    "PLAPI",
    5000
  );

  if (!rendererAPIExposed) {
    throw new Error("Renderer process API is not exposed");
  }

  const previewService = new PreviewService();
  globalThis.previewService = previewService;

  app.mount("#app");
}

initialize();
