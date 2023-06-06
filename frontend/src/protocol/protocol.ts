export type ChannelType = 0x01 | 0x02 | 0x03 | 0x04 | 0x05 | 0x06 | 0x07 | 0x08 | 0x09 | 0x0a;

export type ChannelData = number | boolean | string | ArrayBuffer;

export interface IChannel {
  id: number;
  name: string;
  type: ChannelType;
  flags: number;
}

export interface IProtocol {
  parse(data: ArrayBuffer): void;
  afterConnect(): void;
  disconnect(): void;
  isAvailable(): boolean;
  getChannels(): Promise<IChannel[]>;
  writeChannel(id: number, value: ChannelData): void;
  setChannelWatcher(
    callback: (id: number, data: ChannelData) => void
  ): void;
  removeChannelWatcher(): void;
  dispose(): void;
}


