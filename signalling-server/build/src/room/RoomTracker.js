"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
var RoomTracker = /** @class */ (function () {
    function RoomTracker() {
        this._roomOwners = {};
    }
    RoomTracker.prototype.registerRoom = function (room, owner) {
        this._roomOwners[room] = owner;
    };
    RoomTracker.prototype.unregisterRoom = function (room) {
        delete this._roomOwners[room];
    };
    RoomTracker.prototype.getOwner = function (room) {
        var owner = this._roomOwners[room];
        return (owner) ? owner : null;
    };
    RoomTracker.prototype.isOwner = function (room, id) {
        return this.getOwner(room) === id;
    };
    return RoomTracker;
}());
exports.default = RoomTracker;
;
//# sourceMappingURL=RoomTracker.js.map