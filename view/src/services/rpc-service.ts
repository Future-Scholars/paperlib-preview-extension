import * as electron from "electron";
import { MessagePortRPCProtocol } from "@/base/rpc/messageport-rpc-protocol";
import { RPCService as BaseRPCService } from "@/base/rpc/rpc-service";

export class RPCService extends BaseRPCService {
  constructor() {
    super("rpcService");
  }

  async initCommunication(): Promise<void> {
    // 1. Notify all processes that the current process is happy to communicate now.
    // 2. All other processes will try to send a messageport to here via the main process as a bridge.
    // 3. Once receiving a messageport, the current process will create a MessagePortProtocol for communication.
    // 4. All actionors in the current process will be binded with this protocol immediately.
    // 5. After the protocol is created, we will send a message through the protocol to request the exposed APIs.
    //    All this code should be in the protocol class.


    electron.ipcRenderer.on("response-port", (event, senderID) => {
      const port = event.ports[0];

      if (!this._protocols[senderID]) {
        const protocol = new MessagePortRPCProtocol(
          port,
          "paperlib-preview-extension-window",
          false
        );
        this._protocols[senderID] = protocol;
        this.initActionor(protocol);
      }
    });
    electron.ipcRenderer.postMessage(
      "request-port",
      "paperlib-preview-extension-window"
    );
  }

  async waitForAPI(
    processID: string,
    namespace: string,
    timeout: number
  ): Promise<boolean> {
    return new Promise(async (resolve) => {
      for (let i = 0; i < timeout / 100; i++) {
        if (
          this._protocols[processID] &&
          this._protocols[processID].exposedAPIs[namespace]
        ) {
          resolve(true);
        } else {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      if (
        this._protocols[processID] &&
        this._protocols[processID].exposedAPIs[namespace]
      ) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }
}
