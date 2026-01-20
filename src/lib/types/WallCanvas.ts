export interface WallCanvasOptions {
    posterSize: { x: number, y: number },
    posterPadding: { x: number, y: number },
    rows: number,
    columns: number
}

export interface ImageLoadOptions {
    width?: number,
    height?: number,
    title?: string
}

export interface InitMessage {
    type: "init",
    tile: ImageBitmap
}

export interface RenderMessage {
    type: "render"
}

export interface PreviewMessage {
    type: "preview"
}

export interface FrameMessage {
    type: "frame",
    bitmap: ImageBitmap
}


export type CanvasWorkerMessage = InitMessage | RenderMessage | PreviewMessage | FrameMessage;