// Type declarations for the timesync library, since it does not provide them
// We might get this published to @types/timesync at a later point in time

declare module 'timesync' {
    type Options = {
        delay?: number;
        interval?: number | null;
        now?: Function;
        peers?: string[] | string;
        repeat?: 5;
        server?: string;
        timeout?: number;
    }
    
    class Timesync {
        constructor(options: Options);
    
        offset: number;
        options: Options;
    
        destroy(): void;
        now(): number;
    
        on(event: "change", callback: (offset: number) => unknown): Timesync;
        on(event: "error", callback: (error: any) => unknown): Timesync;
        on(event: "sync", callback: (state: "start" | "end") => unknown): Timesync;
    
        off(event: "change", callback?: (offset: number) => unknown): Timesync;
        off(event: "error", callback?: (error: any) => unknown): Timesync;
        off(event: "sync", callback: (state: "start" | "end") => unknown): Timesync;
    
        sync(): void;
    
        send: (to: string, data: any, timeout: number | undefined) => Promise<unknown>;
        receive: (from: string, data: any) => void;
    }

    export function create(options: Options): Timesync
}