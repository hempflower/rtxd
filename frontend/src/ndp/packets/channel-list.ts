import type { ChannelType, IChannel } from "@/protocol/protocol";
import type { IPacket } from "@/ndp/packets/packet";
import { PacketBuffer } from "@/ndp/packet";

export class PacketChannelList implements IPacket {

    private _channelList: IChannel[] = [];
    private _channelCount = 0;
    private _channelTotalCount = 0;

    get channelList(): IChannel[] {
        return this._channelList;
    }

    set channelList(value: IChannel[]) {
        this._channelList = value;
    }

    get channelCount(): number {
        return this._channelCount;
    }

    set channelCount(value: number) {
        this._channelCount = value;
    }

    get channelTotalCount(): number {
        return this._channelTotalCount;
    }
    set channelTotalCount(value: number) {
        this._channelTotalCount = value;
    }

    serialize(): PacketBuffer {
        const packet = new PacketBuffer(undefined);
        // channel total count
        packet.setUint8(this._channelTotalCount);
        // channel count (this packet)
        packet.setUint8(this._channelCount);
        // channel list
        this._channelList.forEach((channel) => {
            // channel id
            packet.setUint8(channel.id);
            // channel type
            packet.setUint8(channel.type);
            // channel flags
            packet.setUint8(channel.flags);
            // channel name
            packet.setString(channel.name);
        })

        return packet;
        
    }
    deserialize(data: PacketBuffer): void {
        this._channelTotalCount = data.getUint8();
        this._channelCount = data.getUint8();
        for (let i = 0; i < this._channelCount; i++) {
            const id = data.getUint8();
            const type = (data.getUint8() as ChannelType);
            const flags = data.getUint8();
            const name = data.getString();
            const channel = {
                id,
                name,
                type,
                flags,
            };
            this._channelList.push(channel);
        }
    }
}