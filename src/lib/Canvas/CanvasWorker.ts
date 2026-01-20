import type { CanvasWorkerMessage, DoneMessage, FrameMessage, InitMessage } from "$lib/types/WallCanvas";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

const ffmpegBase = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm';

let canvas = new OffscreenCanvas(1, 1);
let tile: ImageBitmap;

let ffmpeg: FFmpeg | null = null;

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
    draw(0);

    ffmpeg = new FFmpeg();

    await ffmpeg.load({
        coreURL: await toBlobURL(`${ffmpegBase}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${ffmpegBase}/ffmpeg-core.wasm`, 'application/wasm'),
    });


    self.postMessage({ type: "ready" })
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

    ctx.filter = "blur(0px)"

    for (let y = -2; y <= 2; y++) {
        for (let x = -2; x <= 2; x++) {
            ctx.drawImage(tile, frame + canvas.width * x, canvas.height * y)
        }
    }

    if (encode && ffmpeg) {
        const blob = await canvas.convertToBlob({ type: "image/png" });
        const buffer = new Uint8Array(await blob.arrayBuffer());

        await ffmpeg.writeFile(
            `${String(frame).padStart(5, "0")}.png`,
            buffer
        );
    }

    const message: FrameMessage = {
        type: "frame",
        bitmap: canvas.transferToImageBitmap()
    }

    self.postMessage(message);

}

async function render() {

    for (let i = 0; i < 100; i++) {
        await draw(i, true);
    }

    await encode();
}

async function encode() {
    if (!ffmpeg) return;

    const firstFrame = await ffmpeg.readFile("00000.png");
    console.log(firstFrame.length); // should be > 0

    console.log(await ffmpeg.listDir("/"))


    await ffmpeg.exec([
        "-i", "%05d.png",
        "-vcodec", "libwebp",
        "-pix_fmt", "yuv420p",
        "-loop", "0",
        "-quality", "50",
        "out.webp"
    ]);

    console.log(await ffmpeg.listDir("/"))


    const data = await ffmpeg.readFile("out.webp");

    const message: DoneMessage = {
        type: "done",
        url: URL.createObjectURL(new Blob(
            [data as BlobPart], { type: "image/webp" }
        ))
    }

    self.postMessage(message);
}