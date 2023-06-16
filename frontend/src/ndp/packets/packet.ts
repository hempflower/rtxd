import { PacketBuffer } from "../packet";

export interface IPacket {
    serialize(): PacketBuffer;
    deserialize(data: PacketBuffer): void;
}