export interface IInterface {
  connect(): void;
  disconnect(): void;
  send(data: ArrayBuffer): void;
  onData(callback: ((data: ArrayBuffer) => void) | null): void;
  onDisconnect(callback: (() => void) | null): void;
  onConnect(callback: (() => void) | null): void;
  dispose(): void;
}

