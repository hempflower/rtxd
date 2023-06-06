export interface IInterface {
  connect(): void;
  disconnect(): void;
  send(data: ArrayBuffer): void;
  onData(callback: (data: ArrayBuffer) => void): void;
  onDisconnect(callback: () => void): void;
  onConnect(callback: () => void): void;
}
