import type { ChannelData, IChannel, IProtocol } from "../protocol/protocol";
import type { IInterface } from "../interface/interface";

export interface ILabClient {
  connect(): void;
  disconnect(): void;
  getChannels(): Promise<IChannel[]>;
  writeChannel(id: number, value: ChannelData): void;
  setChannelWatcher(callback: (id: number, data: ChannelData) => void): void;
  removeChannelWatcher(callback: (id: number, data: ChannelData) => void): void;
  useProtocol(protocol: IProtocol): void;
  useInterface(inte: IInterface): void;
  dispose(): void;
}
