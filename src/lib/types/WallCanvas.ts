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