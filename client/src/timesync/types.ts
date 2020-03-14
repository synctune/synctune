export interface JsonRpcSend {
    "jsonrpc": "2.0";
    "id": string;
    "method": "timesync";
}

export interface JsonRpcReceive {
    "jsonrpc": "2.0";
    "id": string;
    "result": number;
}