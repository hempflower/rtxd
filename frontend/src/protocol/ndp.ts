import { IProtocol, ChannelData, IChannel } from "@/protocol/protocol";

export class NDProtocol implements IProtocol {
  parse(data: ArrayBuffer): void {
    throw new Error("Method not implemented.");
  }
  afterConnect(): void {
    throw new Error("Method not implemented.");
  }
  disconnect(): void {
    throw new Error("Method not implemented.");
  }
  isAvailable(): boolean {
    throw new Error("Method not implemented.");
  }
  getChannels(): Promise<IChannel[]> {
    throw new Error("Method not implemented.");
  }
  writeChannel(id: number, value: ChannelData): void {
    throw new Error("Method not implemented.");
  }
  setChannelWatcher(callback: (id: number, data: ChannelData) => void): void {
    throw new Error("Method not implemented.");
  }
  removeChannelWatcher(): void {
    throw new Error("Method not implemented.");
  }
  dispose(): void {
    throw new Error("Method not implemented.");
  }
}
