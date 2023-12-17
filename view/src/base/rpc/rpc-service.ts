import { MessagePortRPCProtocol } from "./messageport-rpc-protocol";

export type RPCProtocol = MessagePortRPCProtocol;

export abstract class RPCService {
  protected _protocols: { [id: string]: RPCProtocol } = {};
  protected _remoteAPIs: { [id: string]: { [key: string]: any } } = {};
  protected _actionors: { [id: string]: { [key: string]: any } } = {};

  constructor(eventId: string) {}

  setActionor(actionors: { [key: string]: any }): void {
    this._actionors = actionors;
  }

  initActionor(protocol: RPCProtocol): void {
    for (const [key, value] of Object.entries(this._actionors)) {
      protocol.set(key, value);
    }
  }
}
