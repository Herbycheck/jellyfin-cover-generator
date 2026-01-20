export interface WallCanvasOptions {
    posterWidth: number,
    posterPadding: number,
    rows: number,
    columns: number
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


export type CanvasWorkerMessage = InitMessage | RenderMessage | FrameMessage | ReadyMessage | DoneMessage;