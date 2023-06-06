import { ListSerialPort } from "@/../wailsjs/go/main/LabSerial";

export interface SerialOptions {
  baudRate: number;
  dataBits: 5 | 6 | 7 | 8;
  stopBits: 1 | 1.5 | 2;
  parity: "none" | "even" | "mark" | "odd" | "space";
}

export interface ISerialPortClient {
  open(): Promise<void>;
  close(): Promise<void>;
  write(data: ArrayBuffer): Promise<void>;
  onReceive(callback: (data: ArrayBuffer) => void): void;
  onDisconnect(callback: () => void): void;
  onConnect(callback: () => void): void;
  dispose(): void;
}

export const createSerialPortClient = (
  path: string,
  options: SerialOptions
): ISerialPortClient => {
  throw new Error("Not implemented");
};

export const getSerialPorts = (): Promise<string[]> => {
  return ListSerialPort();
};

export class WailsSerialClient implements ISerialPortClient {
  private path: string | null = null;
  private options: SerialOptions | null = null;
  open(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  close(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  write(data: ArrayBuffer): Promise<void> {
    throw new Error("Method not implemented.");
  }
  onReceive(callback: (data: ArrayBuffer) => void): void {
    throw new Error("Method not implemented.");
  }
  onDisconnect(callback: () => void): void {
    throw new Error("Method not implemented.");
  }
  onConnect(callback: () => void): void {
    throw new Error("Method not implemented.");
  }
  dispose(): void {
    throw new Error("Method not implemented.");
  }
}
