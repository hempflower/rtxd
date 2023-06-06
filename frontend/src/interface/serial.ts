import { IInterface } from "@/interface/interface";

class SerialInterface implements IInterface {
  connect(): void {
    throw new Error("Method not implemented.");
  }
  disconnect(): void {
    throw new Error("Method not implemented.");
  }
  send(data: ArrayBuffer): void {
    throw new Error("Method not implemented.");
  }
  onData(callback: (data: ArrayBuffer) => void): void {
    throw new Error("Method not implemented.");
  }
  onDisconnect(callback: () => void): void {
    throw new Error("Method not implemented.");
  }
  onConnect(callback: () => void): void {
    throw new Error("Method not implemented.");
  }
}
