import { IInterface } from "@/interface/interface";

export interface SerialOptions {
  path: string;
  baudRate: number;
  dataBits: 5 | 6 | 7 | 8;
  stopBits: 1 | 1.5 | 2;
  parity: "none" | "even" | "mark" | "odd" | "space";
}

export class SerialInterface implements IInterface {
  private options: SerialOptions;

  constructor(options: SerialOptions) {
    console.log(options);
    this.options = options;
  }
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
  dispose(): void {
      // Nothing
  }
}


export const createSerialInterface = (options : SerialOptions) => {
  return new SerialInterface(options);
}