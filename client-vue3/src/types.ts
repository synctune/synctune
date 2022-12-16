export type SyncStatus =
  | "ready"
  | "syncing"
  | "uploading"
  | "loading"
  | "error";

export interface RoomClient {
  nickname: string;
  id: string;
  status: SyncStatus;
  uploadProgress: number | null; // Number between 0 and 1
}
