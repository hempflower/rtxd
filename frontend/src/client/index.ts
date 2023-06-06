import type { ILabClient, LabClientEvents } from "@/client/client";
import type { ChannelData, IChannel, IProtocol } from "@/protocol/protocol";
import type { IInterface } from "@/interface/interface";
import type { Emitter } from "mitt";
import mitt from "mitt";

class LabClient implements ILabClient {
  private _protocol: IProtocol | null = null;
  private _interface: IInterface | null = null;
  private _events: Emitter<LabClientEvents> = mitt<LabClientEvents>();
  private _isConnected = false;

  get events(): Emitter<LabClientEvents> {
    return this._events;
  }
  connect(): void {
    if (this._isConnected) {
      throw new Error("Already connected");
    }

    if (!this._protocol) {
      throw new Error("No protocol provided");
    }

    if (!this._interface) {
      throw new Error("No interface provided");
    }

    this._interface.connect();
    this._interface.onConnect(() => {
      this._protocol?.afterConnect();
      this._isConnected = true;
      this._events.emit("connect");
    });
    this._interface.onDisconnect(() => {
      this._isConnected = false;
      this._protocol?.disconnect();
      this._events.emit("disconnect");
    });
    this._interface.onData((data) => {
      this._protocol?.parse(data);
    });
  }
  disconnect(): void {
    if (!this._isConnected) {
      throw new Error("Not connected");
    }
    this._interface?.disconnect();
  }
  getChannels(): Promise<IChannel[]> {
    if (!this._isConnected) {
      throw new Error("Not connected");
    }

    return (this._protocol as IProtocol).getChannels();
  }
  writeChannel(id: number, value: ChannelData): void {
    if (!this._isConnected) {
      throw new Error("Not connected");
    }

    (this._protocol as IProtocol).writeChannel(id, value);
  }
  useProtocol(protocol: IProtocol): void {
    if (this._isConnected) {
      throw new Error("Already connected");
    }

    this._protocol = protocol;
  }
  useInterface(inte: IInterface): void {
    if (this._isConnected) {
      throw new Error("Already connected");
    }

    this._interface = inte;
  }
  dispose(): void {
    this.disconnect();

    this._protocol?.dispose();
    this._interface?.dispose();

    this._protocol = null;
    this._interface = null;
  }
}

export const createLabClient = (): ILabClient => {
  // Stub
  return new LabClient();
};
