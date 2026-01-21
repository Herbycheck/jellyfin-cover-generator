export interface WallCanvasOptions {
    posterWidth: number,
    posterPadding: number,
    rows: number,
    columns: number,
    title: string | undefined;
}

export interface InitMessage {
    type: "init",
    tile: ImageBitmap
}

export interface RenderMessage {
    type: "render"
}

export interface FrameMessage {
    type: "frame",
    bitmap: ImageBitmap
}

export interface ReadyMessage {
    type: "ready"
}

export interface DoneMessage {
    type: "done",
    url: string
}

export interface LogMessage {
    type: "log",
    message: string;
}

export interface ProgressMessage {
    type: "progress",
    step: "drawing" | "ffmpeg",
    progress: number
}


export type CanvasWorkerMessage = InitMessage | RenderMessage | FrameMessage | ReadyMessage | DoneMessage | LogMessage | ProgressMessage;