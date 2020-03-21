"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http = __importStar(require("http"));
var express_1 = __importDefault(require("express"));
var signalling_1 = __importDefault(require("./src/io/signalling"));
var PORT = process.env.PORT || 5000;
var app = express_1.default();
var server = http.createServer(app);
server.listen(PORT);
// Setup signalling server
signalling_1.default(server);
//# sourceMappingURL=app.js.map