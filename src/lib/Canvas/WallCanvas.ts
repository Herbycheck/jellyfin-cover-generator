import type { JFItem } from "$lib/types/jellyfin";
import type { WallCanvasOptions, CanvasWorkerMessage, InitMessage, RenderMessage } from "$lib/types/WallCanvas";

import CanvasWorker from '$lib/Canvas/CanvasWorker?worker';

const posterRatio = 1.5;

export class WallCanvas {
    images: Array<HTMLImageElement> = [];
    canvas: HTMLCanvasElement;
    img: HTMLImageElement;
    offscreenCanvas: OffscreenCanvas;

    options: WallCanvasOptions = {
        posterWidth: 250, // The height should be width * 1.5
        posterPadding: 20,
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

    public async setItems(items: Array<JFItem>) {
        const toLoad = [...items]; // Copy the array by value since we will be potentially removing items from it
        const neededCount = this.options.columns * this.options.rows;
        if (toLoad.length > neededCount) {
            toLoad.splice(neededCount); // Keep only enough items to fill one tile so we wont load the user's entire library
        }

        const loading = [];
        for (const item of toLoad) {
            loading.push(this.loadImage(item));
        }
        this.images = await Promise.all(loading);

        this.renderPart();

        const initMessage: InitMessage = { type: "init", tile: this.offscreenCanvas.transferToImageBitmap() };
        this.worker.postMessage(initMessage)
    }

    // Renders a table of imgages that will be tiled later
    private renderPart() {
        this.updateSize()

        this.offscreenCanvas = new OffscreenCanvas(this.canvas.width, this.canvas.height)

        const ctx = this.offscreenCanvas.getContext("2d", { alpha: false });

        if (!ctx) {
            throw new Error("Could not get canvas 2d context for the offscreen canvas");
        }

        ctx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height)

        ctx.filter = "drop-shadow(-2px 2px 5px #202020)"

        let imageIdx = 0;

        const posterHeight = this.options.posterWidth * 1.5;

        for (let y = 0; y < this.options.rows; y++) {
            for (let x = 0; x < this.options.columns; x++) {
                imageIdx++;
                imageIdx = imageIdx % this.images.length

                const dx = x * (this.options.posterWidth + this.options.posterPadding) + this.options.posterPadding / 2;
                const dy = y * (posterHeight + this.options.posterPadding) + this.options.posterPadding / 2;

                ctx.drawImage(this.images[imageIdx], dx, dy, this.options.posterWidth, posterHeight)
            }
        }
    }

    private updateSize() {
        const canvasWidth = (this.options.posterWidth + this.options.posterPadding) * this.options.columns
        const canvasHeight = (this.options.posterWidth * posterRatio + this.options.posterPadding) * this.options.rows

        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
    }

    private async loadImage(item: JFItem): Promise<HTMLImageElement> {
        return new Promise((resolve) => {
            const img = new Image()
            img.onload = () => resolve(img)
            img.crossOrigin = "anonymous"
            img.src = `${item.imageUrl}?fillWidth=${this.options.posterWidth}`
        })
    }
}