// news-image-20261123 — the front page of Monday 23 November 2026.
//
// This repository holds one finished picture of the world's news for
// Monday 23 November 2026: asset/entry.png, a newspaper front page
// drawn for that day alone. The program below is the whole entry: it
// copies that picture to <output>/entry.png, but only after proving
// the file is a complete PNG or JPEG inside the competition's limits.
// It opens no network connection, reads no clock and rolls no dice,
// so two runs write the same bytes.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const BYTE_CAP = 1048576; // 1 MiB, the most the gate allows
const SIDE_CAP = 1024; // pixels on the longest side

const repoRoot = new URL(".", import.meta.url).pathname;
const picture = join(repoRoot, "asset", "entry.png");

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outFile = join(outDir, "entry.png");

function die(message: string): never {
  throw new Error(`entry.png: ${message}`);
}

function u16(buf: Buffer, at: number): number {
  return buf.readUInt16BE(at);
}

function u32(buf: Buffer, at: number): number {
  return buf.readUInt32BE(at);
}

// A PNG keeps its width and height in the IHDR chunk, which always
// sits right after the 8-byte signature.
function pngDimensions(buf: Buffer): [number, number] {
  if (buf.length < 33) {
    die("too short for a PNG header");
  }
  if (buf.subarray(12, 16).toString("ascii") !== "IHDR") {
    die("no IHDR chunk where a PNG keeps one");
  }
  return [u32(buf, 16), u32(buf, 20)];
}

// A JPEG keeps its size in the first frame header (SOF0, SOF1, SOF2).
// Walk the marker segments, each stamped with its own length, until
// that header turns up.
function jpegDimensions(buf: Buffer): [number, number] {
  let i = 2; // just past the SOI marker (FF D8)
  while (i + 9 <= buf.length) {
    if (buf[i] !== 0xff) {
      die("JPEG marker stream is broken");
    }
    const code = buf[i + 1];
    // Standalone markers carry no length: step over them two bytes
    // at a time instead of reading a length that is not there.
    if (code === 0x01 || (code >= 0xd0 && code <= 0xd9)) {
      i += 2;
      continue;
    }
    const seg = u16(buf, i + 2);
    if (seg < 2 || i + 2 + seg > buf.length) {
      die("JPEG segment runs past the end of the file");
    }
    if (code === 0xc0 || code === 0xc1 || code === 0xc2) {
      return [u16(buf, i + 7), u16(buf, i + 5)];
    }
    i += 2 + seg;
  }
  die("no JPEG frame header found");
}

type Format = { kind: "PNG" | "JPEG"; width: number; height: number };

// The gate tells the two formats apart by their first bytes, while the
// file keeps the name entry.png either way. Accept both, and demand a
// whole file: every PNG chunk with its trailer, or a JPEG through its
// end marker.
function check(buf: Buffer): Format {
  if (buf.length === 0) {
    die("empty file");
  }
  if (buf.length > BYTE_CAP) {
    die(`${buf.length} bytes, over the 1 MiB cap`);
  }
  const pngMagic = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);
  const jpgMagic = Buffer.from([0xff, 0xd8, 0xff]);
  if (buf.subarray(0, 8).equals(pngMagic)) {
    const end = buf.subarray(buf.length - 12);
    if (u32(end, 0) !== 0 || end.subarray(4, 8).toString("ascii") !== "IEND") {
      die("PNG is missing its IEND trailer");
    }
    const [width, height] = pngDimensions(buf);
    return { kind: "PNG", width, height };
  }
  if (buf.subarray(0, 3).equals(jpgMagic)) {
    if (buf[buf.length - 2] !== 0xff || buf[buf.length - 1] !== 0xd9) {
      die("JPEG is missing its end marker");
    }
    const [width, height] = jpegDimensions(buf);
    return { kind: "JPEG", width, height };
  }
  die("neither a PNG nor a JPEG");
}

const bytes = readFileSync(picture);
const found = check(bytes);
if (found.width > SIDE_CAP || found.height > SIDE_CAP) {
  die(`${found.width}x${found.height}, over the 1024x1024 cap`);
}

// The grader mounts the output directory, so create it only when it
// is not there already, and never delete anything sitting inside it.
// If the path exists but is a file rather than a directory, say so
// plainly instead of letting the copy fail with a confusing error.
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
} else if (!statSync(outDir).isDirectory()) {
  die(`output directory ${outDir} is a file, not a directory`);
}
copyFileSync(picture, outFile);

// Read the copy back: the run counts only if the file on disk is the
// exact picture that was checked a moment ago.
const back = readFileSync(outFile);
if (!back.equals(bytes)) {
  die("the written copy differs from asset/entry.png");
}
console.log(
  `wrote ${outFile} (${found.kind} ${found.width}x${found.height}, ${bytes.length} bytes)`,
);
