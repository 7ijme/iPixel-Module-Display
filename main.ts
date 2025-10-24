// Create a WebSocket connection
const socket = new WebSocket("ws://localhost:3000");

import { encodeHex } from "jsr:@std/encoding/hex";
import {
  createCanvas,
  EmulatedCanvas2D,
} from "https://deno.land/x/canvas/mod.ts";

socket.addEventListener("open", () => {
  console.log("WebSocket connection established.");
  setInterval(() => {
    // get time
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    const nums = [
      Math.floor(hours / 10),
      hours % 10,
      Math.floor(minutes / 10),
      minutes % 10,
    ];
    socket.send(
      JSON.stringify({
        command: "send_png",
        params: [
          `path_or_hex=${canvasToHex(
            combineCanvases({
			  tl: emoji("🦖"),
              br: makeSmallClock(...nums),
              tr: day(),
            }),
          )}`,
        ],
      }),
    );
  }, 1000);
});

socket.addEventListener("message", (event) => {
  console.log("Message from server:", event.data);
});

function makeClock(...nums: number[]) {
  // Image dimensions
  const width = 64;
  const height = 16;

  // Create a canvas and fill red
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "green";
  canvas.loadFont(Deno.readFileSync("./lcd.14.otf"), {
    family: "digital-7",
  });
  const fontSize = 20;
  ctx.font = `${fontSize}px digital-7`;

  const yOffset = 16;
  ctx.fillText(nums[0].toString(), -2, yOffset);
  ctx.fillText(nums[1].toString(), 14, yOffset);
  ctx.fillText(nums[2].toString(), 36, yOffset);
  ctx.fillText(nums[3].toString(), 51, yOffset);

  ctx.fillRect(30, 3, 4, 4);
  ctx.fillRect(30, 9, 4, 4);

  // Get PNG buffer
  const hex = encodeHex(canvas.toBuffer("image/png"));
  //save to file for debugging
  Deno.writeFileSync("debug.png", canvas.toBuffer("image/png"));
  return hex;
}

function makeSmallClock(...nums: number[]) {
  // Image dimensions
  const width = 32;
  const height = 8;

  // Create a canvas and fill red
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "green";
  canvas.loadFont(Deno.readFileSync("./lcd.14.otf"), {
    family: "digital-7",
  });
  const fontSize = 10;
  ctx.font = `${fontSize}px digital-7`;

  const xOffset = 0;
  const yOffset = 8;
  ctx.fillText(nums[0].toString(), xOffset, yOffset);
  ctx.fillText(nums[1].toString(), 8 + xOffset, yOffset);
  ctx.fillText(nums[2].toString(), 17 + xOffset, yOffset);
  ctx.fillText(nums[3].toString(), 25 + xOffset, yOffset);

  ctx.fillStyle = "blue";
  ctx.fillRect(15, 1, 2, 2);
  ctx.fillRect(15, 5, 2, 2);

  // Get PNG buffer
  // const hex = encodeHex(canvas.toBuffer("image/png"));
  //save to file for debugging
  return canvas;
}

function canvasToHex(canvas: EmulatedCanvas2D) {
  const hex = encodeHex(canvas.toBuffer("image/png"));
  return hex;
}

type combineCanvas = {
  tl?: EmulatedCanvas2D;
  tr?: EmulatedCanvas2D;
  bl?: EmulatedCanvas2D;
  br?: EmulatedCanvas2D;
};
function combineCanvases(canvases: combineCanvas) {
  const newCanvas = createCanvas(64, 16);
  const ctx = newCanvas.getContext("2d");
  if (canvases.tl) {
    ctx.drawImage(canvases.tl, 0, 0);
  }
  if (canvases.tr) {
    ctx.drawImage(canvases.tr, 32, 0);
  }
  if (canvases.bl) {
    ctx.drawImage(canvases.bl, 0, 8);
  }
  if (canvases.br) {
    ctx.drawImage(canvases.br, 32, 8);
  }
  return newCanvas;
}

function day() {
  const canvas = createCanvas(32, 8);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "green";
  const fontSize = 8;
  ctx.font = `${fontSize}px monospace`;
  const now = new Date();
  ctx.fillText(now.toDateString().split(" ")?.[0], 0, fontSize - 1);
  ctx.fillText(
    now.toDateString().split(" ")?.[2].padStart(2, " "),
    22,
    fontSize - 1,
  );
  return canvas;
}

function emoji(emoji: string) {
  const canvas = createCanvas(32, 16);
  const ctx = canvas.getContext("2d");
  canvas.loadFont(Deno.readFileSync("./apple-color-emoji.ttf"), {
    family: "Apple Color Emoji",
  });
  ctx.fillStyle = "green";
  const fontSize = 14;
  ctx.font = `${fontSize}px Apple Color Emoji`;
  ctx.fillText(emoji, 8, fontSize-1);
  return canvas;
}
