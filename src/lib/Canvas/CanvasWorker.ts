import type { CanvasWorkerMessage, DoneMessage, FrameMessage, InitMessage, LogMessage, ProgressMessage, WallCanvasOptions } from "$lib/types/WallCanvas";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

const ffmpegBase = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm';

let canvas = new OffscreenCanvas(1, 1);
let tile: ImageBitmap;

let ffmpeg: FFmpeg | null = null;

let options!: WallCanvasOptions;

self.onmessage = (event: MessageEvent<CanvasWorkerMessage>) => {
    const message = event.data;

    switch (message.type) {
        case "init":
            init(message);
            break;
        case "render":
            render();
            break;
    }
}

async function init(message: InitMessage) {
    canvas = new OffscreenCanvas(message.tile.width, message.tile.height);
    tile = message.tile;
    options = message.options;

    ffmpeg = new FFmpeg();

    ffmpeg.on("log", (event) => {
        self.postMessage({
            type: "log",
            message: event.message
        } as LogMessage)
    })

    ffmpeg.on("progress", (event) => {
        self.postMessage({
            type: "progress",
            step: "ffmpeg",
            progress: event.progress
        } as ProgressMessage)
    })

    await ffmpeg.load({
        coreURL: await toBlobURL(`${ffmpegBase}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${ffmpegBase}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    self.postMessage({ type: "ready" })

    draw(0);
}

async function draw(frame: number = 0, encode = false) {
    const ctx = canvas.getContext("2d", { alpha: false })

    if (!ctx) {
        throw new Error("Could not get canvas 2d context");
    }

    ctx.reset()

    ctx.fillStyle = "#101010"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.setTransform(1, -0.3, 0.5, 1, 0, 0);

    if (options.animationFilter) {
        ctx.filter = options.animationFilter;
    } else {
        ctx.filter = "blur(0px)"
    }
    for (let y = -2; y <= 2; y++) {
        for (let x = -2; x <= 2; x++) {
            ctx.drawImage(tile, frame + canvas.width * x, canvas.height * y)
        }
    }

    if(options.title) addText(ctx);

    if (encode && ffmpeg) {
        const blob = await canvas.convertToBlob({ type: "image/png" });
        const buffer = new Uint8Array(await blob.arrayBuffer());

        await ffmpeg.writeFile(
            `${String(frame).padStart(5, "0")}.png`,
            buffer
        );
    }

    self.postMessage({
        type: "frame",
        bitmap: canvas.transferToImageBitmap()
    } as FrameMessage);

    self.postMessage({
        type: "progress",
        step: "drawing",
        progress: frame / canvas.width
    } as ProgressMessage)

}

async function render() {

    for (let i = 0; i < canvas.width; i++) {
        await draw(i, true);
    }

    await encode();
}

async function encode() {
    if (!ffmpeg) return;

    await ffmpeg.exec([
        "-i", "%05d.png",
        "-vcodec", "libwebp",
        "-pix_fmt", "yuv420p",
        "-loop", "0",
        "-quality", "50",
        "out.webp"
    ]);


    const data = await ffmpeg.readFile("out.webp");

    const message: DoneMessage = {
        type: "done",
        url: URL.createObjectURL(new Blob(
            [data as BlobPart], { type: "image/webp" }
        ))
    }

    self.postMessage(message);
}

function addText(ctx: OffscreenCanvasRenderingContext2D) {
    ctx.filter = "blur(0px)";
    ctx.resetTransform()

    // Select the font size and type from one of the natively available fonts
    ctx.font = 'bold 60px sans-serif';

    // Select the style that will be used to fill the text in
    ctx.fillStyle = '#ffffff';

    // Actually fill the text with a solid color
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(options.title!, canvas.width / 2, canvas.height / 2);
}