// Create a WebSocket connection
const socket = new WebSocket("ws://localhost:3000");

import { encodeHex } from "jsr:@std/encoding/hex";
import {
  CanvasRenderingContext2D,
  createCanvas,
  EmulatedCanvas2D,
} from "https://deno.land/x/canvas/mod.ts";

socket.addEventListener("open", () => {
  console.log("WebSocket connection established.");
  setInterval(() => {
    // get time
    const now = new Date();
    const hours = now.getMinutes();
    const minutes = now.getSeconds();

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
            combineCanvases(
              makeSmallClock("br", 0, 0, 0, 0),
              makeSmallClock("bl", 0, 0, 0, 0),
            ),
          )}`,
        ],
      }),
    );
  }, 1000);
  const canvas = createCanvas(64, 16);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "blue";
  const fontSize = 8;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillText("hi", 0, fontSize);
  const hex = encodeHex(canvas.toBuffer("image/png"));
  // save to file for debugging
  Deno.writeFileSync("debug.png", canvas.toBuffer("image/png"));
  socket.send(
    JSON.stringify({
      command: "send_png",
      params: [`path_or_hex=${hex}`],
    }),
  );
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

function makeSmallClock(where: "tl" | "tr" | "bl" | "br", ...nums: number[]) {
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
  const fontSize = 10;
  ctx.font = `${fontSize}px digital-7`;

  const xOffset = where.includes("r") ? 32 : 0;
  const yOffset = 8 + (where.includes("t") ? 0 : 8);
  ctx.fillText(nums[0].toString(), xOffset, yOffset);
  ctx.fillText(nums[1].toString(), 8 + xOffset, yOffset);
  ctx.fillText(nums[2].toString(), 17 + xOffset, yOffset);
  ctx.fillText(nums[3].toString(), 25 + xOffset, yOffset);

  ctx.fillStyle = "blue";
  ctx.fillRect(
    where.includes("l") ? 15 : 47,
    where.includes("t") ? 1 : 10,
    2,
    2,
  );
  ctx.fillRect(
    where.includes("l") ? 15 : 47,
    where.includes("t") ? 5 : 13,
    2,
    2,
  );

  // Get PNG buffer
  // const hex = encodeHex(canvas.toBuffer("image/png"));
  //save to file for debugging
  return canvas;
}

function canvasToHex(canvas: EmulatedCanvas2D) {
  const hex = encodeHex(canvas.toBuffer("image/png"));
  return hex;
}

function combineCanvases(...canvas: EmulatedCanvas2D[]) {
  const newCanvas = createCanvas(64, 16);
  const ctx = newCanvas.getContext("2d");
  canvas.forEach((c) => {
    ctx.drawImage(c, 0, 0);
  });
  return newCanvas;
}
