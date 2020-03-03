interface RoomOwnerMap {
    [room: string]: string
};

export default class RoomMap {
    private _roomOwners: RoomOwnerMap;

    constructor() {
        this._roomOwners = {};
    }

    registerRoom(room: string, owner: string) {
        this._roomOwners[room] = owner;
    }

    unregisterRoom(room: string) {
        delete this._roomOwners[room];
    }

    getOwner(room: string): string | null {
        const owner = this._roomOwners[room];

        return (owner) ? owner : null;
    }

    isOwner(room: string, id: string): boolean {
        return this.getOwner(room) === id;
    }
};