import type { JFItem } from "$lib/types/jellyfin";
import type { WallCanvasOptions, ImageLoadOptions, CanvasWorkerMessage, InitMessage, RenderMessage } from "$lib/types/WallCanvas";

import CanvasWorker from '$lib/Canvas/CanvasWorker?worker';

export class WallCanvas {
    images: Array<HTMLImageElement> = [];
    canvas: HTMLCanvasElement;
    img: HTMLImageElement;
    offscreenCanvas: OffscreenCanvas;

    options: WallCanvasOptions = {
        posterSize: { x: 250, y: 375 },
        posterPadding: { x: 20, y: 20 },
        rows: 2,
        columns: 4
    }

    title: string | null = null;
    worker: Worker;

    public constructor(canvas: HTMLCanvasElement, image: HTMLImageElement) {
        this.canvas = canvas;
        this.img = image;

        this.offscreenCanvas = new OffscreenCanvas(canvas.width, canvas.height);

        this.worker = new CanvasWorker();

        this.worker.onmessage = (event: MessageEvent<CanvasWorkerMessage>) => {
            const message = event.data;

            switch (message.type) {
                case "frame":
                    this.recieveFrame(message.bitmap);
                    break;
                case "ready":
                    console.log("Worker ready");
                    break;
                case "done":
                    this.img.src = message.url;
                    console.log(message.url);
                    break;
            }
        }
    }

    public render() {
        const renderMesage: RenderMessage = {
            type: "render"
        }

        this.worker.postMessage(renderMesage);
    }

    private recieveFrame(bitmap: ImageBitmap) {
        const ctx = this.canvas.getContext("2d")!;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.drawImage(bitmap, 0, 0);
    }

    public async loadImages(items: Array<JFItem>, options: ImageLoadOptions = {}) {
        const finalOptions = { width: 250, height: 375, title: undefined, ...options };

        this.title = finalOptions.title || null;

        let loading = [];

        for (const item of items) {
            loading.push(this.loadImage(item));
        }

        this.images = await Promise.all(loading);

        let canvasWidth = (finalOptions.width + this.options.posterPadding.x) * this.options.columns
        let canvasHeight = (finalOptions.height + this.options.posterPadding.y) * this.options.rows

        this.setSize(canvasWidth, canvasHeight)

        this.renderPart(canvasWidth, canvasHeight);

        const initMessage: InitMessage = { type: "init", tile: this.offscreenCanvas.transferToImageBitmap() };
        this.worker.postMessage(initMessage)
    }

    // Renders a table of imgages that will be tiled later
    private renderPart(width: number, height: number) {
        this.offscreenCanvas = new OffscreenCanvas(width, height)
        const ctx = this.offscreenCanvas.getContext("2d", { alpha: false });

        if (!ctx) {
            throw new Error("Could not get canvas 2d context for the offscreen canvas");
        }

        ctx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height)

        ctx.filter = "drop-shadow(-2px 2px 5px #202020)"

        let imageIdx = 0;

        for (let y = 0; y < this.options.rows; y++) {
            for (let x = 0; x < this.options.columns; x++) {
                imageIdx++;
                imageIdx = imageIdx % this.images.length

                let dx = x * (this.options.posterSize.x + this.options.posterPadding.x) + this.options.posterPadding.x / 2;
                let dy = y * (this.options.posterSize.y + this.options.posterPadding.y) + this.options.posterPadding.y / 2;

                ctx.drawImage(this.images[imageIdx], dx, dy)
            }
        }
    }

    private drawText(ctx: CanvasRenderingContext2D, text: string) {
        ctx.resetTransform()
        ctx.filter = "brightness(1)"
        // Select the font size and type from one of the natively available fonts
        ctx.font = 'bold 60px sans-serif';

        // Select the style that will be used to fill the text in
        ctx.fillStyle = '#ffffff';

        // Actually fill the text with a solid color
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
    }

    private setSize(canvasWidth: number, canvasHeight: number) {
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
    }

    private async loadImage(item: JFItem): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve(img)
            img.crossOrigin = "anonymous"
            img.src = item.imageUrl
        })
    }
}