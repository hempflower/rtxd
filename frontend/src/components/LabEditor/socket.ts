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
    // If this socket accepts all types, then it can be connected to any input socket
    return this._acceptsTypes.length === 0 ? true : this._acceptsTypes.includes(otherSocket.dataType);
  }
}

/**
 * Just marks a socket as an action socket
 */
export class ActionSocket extends ClassicPreset.Socket {
    constructor() {
        super("Action");
    }

    canBeConnected(otherSocket: ClassicPreset.Socket) {
        return otherSocket instanceof ActionSocket;
    }
    
}