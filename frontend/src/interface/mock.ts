import type { IInterface } from "@/interface/interface";
import { PacketBuffer,buildPacket,parsePacket } from "@/ndp/packet";

const mockChannelList = [
  {
    id: 1,
    name: "Channel 1",
    type: 0x01,
  },
  {
    id: 2,
    name: "Channel 2",
    type: 0x01,
  },
  {
    id: 3,
    name: "Channel 3",
    type: 0x01,
  },
  {
    id: 4,
    name: "Channel 4",
    type: 0x01,
  },
  {
    id: 5,
    name: "Channel 5",
    type: 0x01,
  },
];

const createFakeChannelDataPacket = () => {
  const packet = new PacketBuffer(undefined);
  // channel id
  packet.setInt8(5);
  // channel data
  packet.setInt8(9);

  const packetData = buildPacket(packet, 0x02)
  return packetData;
}

const createFakeChannelListPacket = () => {
  const packet = new PacketBuffer(undefined);

  // channel total count
  packet.setInt8(mockChannelList.length);
  // channel count (this packet)
  packet.setInt8(mockChannelList.length);
  // channel list
  mockChannelList.forEach((channel) => {
    // channel id
    packet.setUint8(channel.id);
    // channel type
    packet.setUint8(channel.type);
    // channel flags
    packet.setUint8(0xff);
    // channel name
    packet.setString(channel.name);
  });


  return buildPacket(packet, 0x01);
}

export class MockInterface implements IInterface {
  private mockDataTimer = 0;
  private _isConnected = false;
  private _onDataCallback: ((data: ArrayBuffer) => void) | null = null;
  private _onDisconnectCallback: (() => void) | null = null;
  private _onConnectCallback: (() => void) | null = null;


  connect(): void {
    this._isConnected = true;
    this._onConnectCallback?.();

    this.mockDataTimer = setInterval(() => this._sendMockData(), 50);

  }
  disconnect(): void {
    this._isConnected = false;
    this._onDisconnectCallback?.();
    if (this.mockDataTimer) {
      clearInterval(this.mockDataTimer);
    }
  }
  send(data: ArrayBuffer): void {
    // Directly output the data to the console
    console.log(data);
    // Parse the packet
    const packet = parsePacket(data);
    if (packet) {
      switch (packet.id) {
        case 0x01: {
          // Channel list
          const channelList = createFakeChannelListPacket();
          if (this._onDataCallback) {
            this._onDataCallback(channelList);
          }
          break;
        }
        case 0x02: {
          // Channel Write
          const packetBody = packet.body;
          const channelId = packetBody.getUint8();
          // Mock channel data type are all uint8
          const channelData = packetBody.getUint8();
          // Change the channel data
          mockChannelList[channelId - 1].type = channelData;
          break;
        }
        default: {
          // Unknown packet
          break;
        }
      }
    }
  }
  onData(callback: ((data: ArrayBuffer) => void) | null): void {
    this._onDataCallback = callback;
  }
  onDisconnect(callback: (() => void) | null): void {
    this._onDisconnectCallback = callback;
  }
  onConnect(callback: (() => void) | null): void {
    this._onConnectCallback = callback;
  }
  dispose(): void {
    if(this._isConnected) {
      this.disconnect();
    }
  }

  private _sendMockData() {
    // Stub
    if (this._onDataCallback) {
        // Make a mock packet
        const packet = createFakeChannelDataPacket();
        this._onDataCallback(packet);

    }
  }
}

export const createMockInterface = () => {
  return new MockInterface();
};
