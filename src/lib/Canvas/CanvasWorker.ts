import type { CanvasWorkerMessage, FrameMessage } from "$lib/types/WallCanvas";

let canvas = new OffscreenCanvas(1, 1);
let tile: ImageBitmap;

self.onmessage = (event: MessageEvent<CanvasWorkerMessage>) => {
    const message = event.data;

    console.log(message);

    switch (message.type) {
        case "init":
            canvas = new OffscreenCanvas(message.tile.width, message.tile.height);
            tile = message.tile;
            break;

        case "preview":
            draw();
            break;
    }
}

function draw(frame: number = 0) {
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

    const message: FrameMessage = {
        type: "frame",
        bitmap: canvas.transferToImageBitmap()
    }

    self.postMessage(message);
}