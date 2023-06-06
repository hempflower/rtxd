import type { ChannelData, IChannel, IProtocol } from "../protocol/protocol";
import type { IInterface } from "../interface/interface";
import type { Emitter } from "mitt";

export type LabClientEvents = {
  connect: void;
  disconnect: void;
  data: {
    channelID: number;
    data: ChannelData;
  };
};

export interface ILabClient {
  connect(): void;
  disconnect(): void;
  getChannels(): Promise<IChannel[]>;
  writeChannel(id: number, value: ChannelData): void;
  get events(): Emitter<LabClientEvents>;
  useProtocol(protocol: IProtocol): void;
  useInterface(inte: IInterface): void;
  dispose(): void;
}
