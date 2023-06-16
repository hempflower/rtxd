export class NDPStream {
  private _buffer: ArrayBuffer;
  private _view: DataView;
  private _offset: number;

  private _size_offset = 1 + 1;
  private _size_length = 2; // size is 2 bytes
  private _header_length = 1 + 1 + 2; // packet header + id + size
  private _footer_length = 1; // checksum

  private _packet_size = 0;

  private _has_meet_header = false;

  private _onPacketCallback: ((packet: ArrayBuffer) => void) | null = null;

  constructor() {
    this._buffer = new ArrayBuffer(4096);
    this._view = new DataView(this._buffer);
    this._offset = 0;
  }

  writeData(data: ArrayBuffer): void {
    const length = data.byteLength;
    const view = new DataView(data);
    for (let i = 0; i < length; i++) {
      this._writeByte(view.getUint8(i));
    }
  }

  private reset(): void {
    this._offset = 0;
    this._packet_size = 0;
    this._has_meet_header = false;
  }

  private _writeByte(value: number): void {
    if (this._offset + 1 > this._buffer.byteLength) {
      this.reset();
      return;
    }
    // check offset is not out of range
    if (!this._has_meet_header) {
      if (value === 0x5a) {
        this._has_meet_header = true;
      } else {
        this.reset();
        return;
      }
    }
    this._view.setUint8(this._offset, value);
    // is packet size field
    if (
      this._offset >= this._size_offset &&
      this._offset < this._size_offset + this._size_length
    ) {
      this._packet_size +=
        value <<
        (8 * (this._size_length - 1 - (this._offset - this._size_offset)));
      if (this._packet_size > 4096) {
        this.reset();
        return;
      }
    } else {
      if (this._packet_size !== 0) {
        if (
          this._offset + 1 ===
          this._header_length + this._packet_size + this._footer_length
        ) {
          // is checksum field. it is the last byte of the packet

          // packet is valid
          if (this._onPacketCallback) {
            this._onPacketCallback(this._buffer.slice(0, this._offset + 1));
            this.reset();
            return;
          }
        }
      }
    }
    this._offset++;
  }

  onPacket(callback: ((packet: ArrayBuffer) => void) | null): void {
    this._onPacketCallback = callback;
  }
}
