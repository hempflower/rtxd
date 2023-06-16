export class PacketBuffer {
  private _buffer: ArrayBuffer;
  private _view: DataView;
  private _offset: number;

  constructor(buffer: ArrayBuffer | undefined) {
    if (buffer) {
      this._buffer = buffer;
    } else {
      this._buffer = new ArrayBuffer(64);
    }
    this._view = new DataView(this._buffer);
    this._offset = 0;
  }

  get buffer(): ArrayBuffer {
    return this._buffer;
  }

  get offset(): number {
    return this._offset;
  }

  get length(): number {
    return this._offset;
  }

  get view(): DataView {
    return this._view;
  }

  build(): ArrayBuffer {
    return this._buffer.slice(0, this._offset);
  }

  reset(): void {
    this._offset = 0;
  }

  getUint8(): number {
    const value = this._view.getUint8(this._offset);
    this._offset += 1;
    return value;
  }

  getUint16(): number {
    const value = this._view.getUint16(this._offset);
    this._offset += 2;
    return value;
  }

  getUint32(): number {
    const value = this._view.getUint32(this._offset);
    this._offset += 4;
    return value;
  }

  getInt8(): number {
    const value = this._view.getInt8(this._offset);
    this._offset += 1;
    return value;
  }

  getInt16(): number {
    const value = this._view.getInt16(this._offset);
    this._offset += 2;
    return value;
  }

  getInt32(): number {
    const value = this._view.getInt32(this._offset);
    this._offset += 4;
    return value;
  }

  getFloat32(): number {
    const value = this._view.getFloat32(this._offset);
    this._offset += 4;
    return value;
  }

  getFloat64(): number {
    const value = this._view.getFloat64(this._offset);
    this._offset += 8;
    return value;
  }

  getString(): string {
    // String ends with 0x00
    let length = 0;
    for (let i = this._offset; i < this._buffer.byteLength; i++) {
      if (this._view.getUint8(i) === 0) {
        break;
      }
      length++;
    }
    const bytes = new Uint8Array(this._buffer, this._offset, length);
    const value = new TextDecoder().decode(bytes);
    this._offset += length + 1;
    return value;
  }

  getBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(this._buffer.slice(this._offset,this._offset + length)) 
    this._offset += length;
    return bytes;
  }

  setUint8(value: number): void {
    this._view.setUint8(this._offset, value);
    this._offset += 1;
  }

  setUint16(value: number): void {
    this._ensureSize(2);
    this._view.setUint16(this._offset, value);
    this._offset += 2;
  }

  setUint32(value: number): void {
    this._ensureSize(4);
    this._view.setUint32(this._offset, value);
    this._offset += 4;
  }

  setInt8(value: number): void {
    this._ensureSize(1);
    this._view.setInt8(this._offset, value);
    this._offset += 1;
  }

  setInt16(value: number): void {
    this._ensureSize(2);
    this._view.setInt16(this._offset, value);
    this._offset += 2;
  }

  setInt32(value: number): void {
    this._ensureSize(4);
    this._view.setInt32(this._offset, value);
    this._offset += 4;
  }

  setFloat32(value: number): void {
    this._ensureSize(4);
    this._view.setFloat32(this._offset, value);
    this._offset += 4;
  }

  setFloat64(value: number): void {
    this._ensureSize(8);
    this._view.setFloat64(this._offset, value);
    this._offset += 8;
  }

  setString(value: string): void {
    const bytes = new TextEncoder().encode(value);
    this.setBytes(bytes);
    // String ends with 0x00
    this.setUint8(0);
  }

  setBytes(value: Uint8Array): void {
    // check buffer size
    this._ensureSize(value.byteLength);

    for (let i = 0; i < value.byteLength; i++) {
      this._view.setUint8(this._offset + i, value[i]);
    }
    this._offset += value.byteLength;
  }

  private _ensureSize(size: number): void {
    if (this._offset + size > this._buffer.byteLength) {
      const newBuffer = new ArrayBuffer(this._buffer.byteLength * 2);
      new Uint8Array(newBuffer).set(new Uint8Array(this._buffer));
      this._buffer = newBuffer;
      this._view = new DataView(this._buffer);
    }
  }
}

export const buildPacket = (packetBody: PacketBuffer,packetId : number): ArrayBuffer => {
  const packet = new PacketBuffer(undefined);
  // Packet header
  packet.setUint8(0x5A);
  // Packet ID
  packet.setUint8(packetId);
  // Packet length
  packet.setUint16(packetBody.length);
  // Packet body
  const bytes = new Uint8Array(packetBody.build());
  packet.setBytes(bytes);
  // Checksum
  let checksum = 0;
  bytes.forEach((byte) => {
    checksum += byte;
  })
  packet.setUint8(checksum & 0xFF);

  return packet.build();
}

export interface PacketInfo {
  id: number;
  size: number;
  body: PacketBuffer;
}

export const parsePacket = (data: ArrayBuffer): PacketInfo | null => {
  const packet = new PacketBuffer(data);
  // Packet header
  if (packet.getUint8() !== 0x5A) {
    return null;
  }
  // Packet ID
  const id = packet.getUint8();
  // Packet length
  const size = packet.getUint16();
  // Packet body
  const body = new PacketBuffer(packet.getBytes(size).buffer);
  // Checksum
  const checksum = packet.getUint8();
  let checksumCalc = 0;
  for (let i = 0; i < size; i++) {
    checksumCalc += body.view.getUint8(i);
  }

  if ((checksumCalc & 0xFF) !== checksum) {
    return null;
  }

  return {
    id,
    size,
    body,
  };
}

