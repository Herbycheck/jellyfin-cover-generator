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
    options: WallCanvasOptions
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