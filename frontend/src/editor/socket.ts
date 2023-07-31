import { ClassicPreset } from "rete";

/**
 * Strongly typed for data output sockets
 */
export class DataOutputSocket extends ClassicPreset.Socket {
  private _dataType: string;

  constructor(dataType: string) {
    super("dataInput");
    this._dataType = dataType;
  }

  get dataType() {
    return this._dataType;
  }

  set dataType(value: string) {
    this._dataType = value;
  }
}

export class DataInputSocket extends ClassicPreset.Socket {
  private _acceptsTypes: string[] = [];

  constructor(acceptsTypes: string[]) {
    super("dataOuput");
    this._acceptsTypes = acceptsTypes;
  }

  get acceptsTypes() {
    return this._acceptsTypes;
  }

  canBeConnected(otherSocket: ClassicPreset.Socket) {
    if (!(otherSocket instanceof DataOutputSocket)) {
      return false;
    }
    if (otherSocket.dataType === "*") {
      return true;
    }
    // If this socket accepts all types, then it can be connected to any input socket
    return this._acceptsTypes.length === 0
      ? true
      : this._acceptsTypes.includes(otherSocket.dataType);
  }
}

export class ActionInputSocket extends ClassicPreset.Socket {
  private _acceptsTypes: string[] = [];

  constructor(acceptsTypes: string[]) {
    super("actionInput");
    this._acceptsTypes = acceptsTypes;
  }

  get acceptsTypes() {
    return this._acceptsTypes;
  }

  canBeConnected(otherSocket: ClassicPreset.Socket) {
    if (otherSocket instanceof ActionOutputSocket) {
      // If this input socket set type as '*' , then it can be connected to any output socket
      if (otherSocket.dataType === "*") {
        return true;
      }

      return this._acceptsTypes.length === 0
        ? true
        : this._acceptsTypes.includes(otherSocket.dataType);
    }
    return false;
  }
}

/**
 * Just marks a socket as an action socket
 */
export class ActionOutputSocket extends ClassicPreset.Socket {
  private _dataType: string;

  constructor(dataType: string) {
    super("actionOuput");
    this._dataType = dataType;
  }

  get dataType() {
    return this._dataType;
  }
}
