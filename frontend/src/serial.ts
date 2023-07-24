import {
  ListSerialPort,
  OpenSerialPort,
  WriteSerialPort,
  CloseSerialPort,
} from "@/../wailsjs/go/main/LabSerial";

import mitt from "mitt";
import { EventsOn } from "@/../wailsjs/runtime/runtime";

import { Base64 } from "js-base64";

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
  onConnect(callback: (connectionId: number) => void): void;
  destroy(): void;
}

interface SerialEventPayload {
  connectionId: number;
}

interface SerialDataEventPayload extends SerialEventPayload {
  data: string;
}

// Serial Data Event
export const SERIAL_DATA_EVENT = "serial-data-receive";
export const SERIAL_CONNECT_EVENT = "serial-connected";
export const SERIAL_DISCONNECT_EVENT = "serial-disconnected";

export const serialEventBus = mitt<{
  [SERIAL_DATA_EVENT]: SerialDataEventPayload;
  [SERIAL_CONNECT_EVENT]: SerialEventPayload;
  [SERIAL_DISCONNECT_EVENT]: SerialEventPayload;
}>();

EventsOn(SERIAL_DATA_EVENT, (data: SerialDataEventPayload) => {
  serialEventBus.emit(SERIAL_DATA_EVENT, data);
});

EventsOn(SERIAL_CONNECT_EVENT, (data: SerialEventPayload) => {
  serialEventBus.emit(SERIAL_CONNECT_EVENT, data);
});

EventsOn(SERIAL_DISCONNECT_EVENT, (data: SerialEventPayload) => {
  serialEventBus.emit(SERIAL_DISCONNECT_EVENT, data);
});

export const createSerialPortClient = (
  path: string,
  options: SerialOptions
): ISerialPortClient => {
  return new WailsSerialClient(path, options);
};

export const getSerialPorts = (): Promise<string[]> => {
  return ListSerialPort();
};

const ArrayBufferToNumberArray = (buffer: ArrayBuffer): Array<number> => {
  const view = new Uint8Array(buffer);
  return Array.from(view);
};

export class WailsSerialClient implements ISerialPortClient {
  private path: string;
  private options: SerialOptions;
  private connectionId = -1;

  private _onConnectCB: ((connectionId: number) => void) | null = null;
  private _onDisconnectCB: (() => void) | null = null;
  private _onReceiveCB: ((data: ArrayBuffer) => void) | null = null;

  private _onConnect = (data: SerialEventPayload) => {
    if (this.connectionId !== -1 && this._onConnectCB) {
      if (data.connectionId === this.connectionId) {
        this._onConnectCB(this.connectionId);
      }
    }
  };

  private _onDisconnect = (data: SerialEventPayload) => {
    if (this.connectionId !== -1 && this._onDisconnectCB) {
      if (data.connectionId === this.connectionId) {
        this._onDisconnectCB();
        this.connectionId = -1;
      }
    }
  };

  private _onReceive = (data: ArrayBuffer) => {
    if (this.connectionId !== -1 && this._onReceiveCB) {
      this._onReceiveCB(data);
    }
  };

  constructor(path: string, options: SerialOptions) {
    this.path = path;
    this.options = options;

    serialEventBus.on(SERIAL_DATA_EVENT, this._serialDataCallback);
    serialEventBus.on(SERIAL_CONNECT_EVENT, this._onConnect);
    serialEventBus.on(SERIAL_DISCONNECT_EVENT, this._onDisconnect);
  }

  private _serialDataCallback = (data: SerialDataEventPayload) => {
    if (this.connectionId !== -1 && this._onReceive) {
      if (data.connectionId === this.connectionId) {
        this._onReceive(Base64.toUint8Array(data.data).buffer);
      }
    }
  };

  async open(): Promise<void> {
    const parityMap = {
      none: 0,
      odd: 1,
      even: 2,
      mark: 3,
      space: 4,
    };

    console.log(this.options);

    const connectionId = await OpenSerialPort(
      this.path,
      this.options.baudRate,
      this.options.dataBits,
      parityMap[this.options.parity],
      this.options.stopBits
    );
    this.connectionId = connectionId;
    if (this.connectionId !== -1 && this._onConnectCB) {
      this._onConnectCB(this.connectionId);
    }
  }
  async close(): Promise<void> {
    if (this.connectionId !== -1) {
      await CloseSerialPort(this.connectionId);
    } else {
      return Promise.resolve();
    }
  }
  write(data: ArrayBuffer): Promise<void> {
    if (this.connectionId !== -1) {
      return WriteSerialPort(this.connectionId, ArrayBufferToNumberArray(data));
    } else {
      return Promise.resolve();
    }
  }
  onReceive(callback: (data: ArrayBuffer) => void): void {
    this._onReceiveCB = callback;
  }
  onDisconnect(callback: () => void): void {
    this._onDisconnectCB = callback;
  }
  onConnect(callback: (connectionId: number) => void): void {
    this._onConnectCB = callback;
  }
  destroy(): void {
    serialEventBus.off(SERIAL_DATA_EVENT, this._serialDataCallback);
    serialEventBus.off(SERIAL_CONNECT_EVENT, this._onConnect);
    serialEventBus.off(SERIAL_DISCONNECT_EVENT, this._onDisconnect);
  }
}
