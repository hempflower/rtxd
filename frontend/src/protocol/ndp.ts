import {
  IProtocol,
  ChannelData,
  IChannel,
  ChannelType,
} from "@/protocol/protocol";
import { PacketBuffer, buildPacket, parsePacket } from "@/ndp/packet";
import { NDPStream } from "@/ndp/stream";
import { PacketChannelList } from "@/ndp/packets/channel-list";

const createFetchChannelListPacket = () => {
  const packet = new PacketBuffer(undefined);
  return buildPacket(packet, 0x01);
};

export class NDProtocol implements IProtocol {
  private _dataBuffer: ArrayBuffer;
  private _view: DataView;
  private _offset = 0;
  private _stream = new NDPStream();

  private _sendDataFn: ((data: ArrayBuffer) => void) | null = null;

  private _onFetchChannelList: (() => void) | null = null;

  private _ChannelListCache: IChannel[] = [];
  private _ChannelListTotlal = 0;

  constructor() {
    this._dataBuffer = new ArrayBuffer(4096);
    this._view = new DataView(this._dataBuffer);

    this._stream.onPacket((buf) => this._onPacketReceived(buf));
  }

  private _onPacketReceived(packetBuf: ArrayBuffer): void {
    const packet = parsePacket(packetBuf);
    console.log(packet);
    if (!packet) {
      return;
    }

    switch (packet.id) {
      case 0x01: {
        // Channel list
        const channelListPacket = new PacketChannelList();
        channelListPacket.deserialize(packet.body);
        this._ChannelListCache.push(...channelListPacket.channelList);
        this._ChannelListTotlal = channelListPacket.channelTotalCount;
        
        // check if we have all the channels
        if (this._ChannelListCache.length === this._ChannelListTotlal) {
          this._onFetchChannelList?.();
        }
        break;
      }
      default:
        break;
    }
  }
  parse(data: ArrayBuffer): void {
    this._stream.writeData(data);
  }
  afterConnect(sendDataFn: (data: ArrayBuffer) => void): void {
    this._sendDataFn = sendDataFn;
  }
  disconnect(): void {
    // Nothing to do
  }
  isAvailable(): boolean {
    return true;
  }
  getChannels(): Promise<IChannel[]> {
    return new Promise((resolve) => {
      this._onFetchChannelList = () => {
        resolve(this._ChannelListCache);

        this._onFetchChannelList = null;
        // reset cache
        this._ChannelListCache = [];
        this._ChannelListTotlal = 0;
      };
      this._ChannelListCache = [];
      this._ChannelListTotlal = 0;
      const packet = createFetchChannelListPacket();
      this._sendDataFn?.(packet);
    });
  }
  writeChannel(id: number, value: ChannelData): void {
    throw new Error("Method not implemented.");
  }
  setChannelWatcher(
    callback: ((id: number, data: ChannelData) => void) | null
  ): void {
    throw new Error("Method not implemented.");
  }
  dispose(): void {
    throw new Error("Method not implemented.");
  }
}

export const createNDProtocol = () => {
  return new NDProtocol();
};
