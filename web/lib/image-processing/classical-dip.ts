/**
 * PCB Vision AI — Client-Side Classical Digital Image Processing (DIP)
 * ---------------------------------------------------------------------
 * High-performance, pure TypeScript implementation of reference-based
 * template differencing, Gaussian filtering, Otsu thresholding,
 * mathematical morphology, and connected-component analysis.
 */

export interface DIPCandidateBox {
  x: number;
  y: number;
  width: number;
  height: number;
  area: number;
}

export interface DIPPipelineResult {
  candidateBoxes: DIPCandidateBox[];
  diffCanvasUrl: string;
  thresholdCanvasUrl: string;
  cleanedCanvasUrl: string;
  annotatedCanvasUrl: string;
  processingTimeMs: number;
  totalCandidateArea: number;
}

export interface DIPOptions {
  thresholdMethod: "otsu" | "adaptive" | "fixed";
  fixedThresholdValue?: number;
  gaussianKernelSize?: 3 | 5;
  morphologyKernelSize?: 3 | 5;
  minDefectArea?: number;
  maxDefectArea?: number;
}

/**
 * Convert ImageData to Grayscale in-place (Rec. 601 Luma: Y = 0.299R + 0.587G + 0.114B)
 */
export function toGrayscale(data: Uint8ClampedArray): Uint8ClampedArray {
  const gray = new Uint8ClampedArray(data.length / 4);
  for (let i = 0; i < gray.length; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    gray[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }
  return gray;
}

/**
 * 2D Gaussian Blur Convolution with symmetric extension
 */
export function gaussianBlur(
  gray: Uint8ClampedArray,
  width: number,
  height: number,
  kernelSize: 3 | 5 = 3
): Uint8ClampedArray {
  const output = new Uint8ClampedArray(gray.length);
  const kernel3 = [
    [1, 2, 1],
    [2, 4, 2],
    [1, 2, 1],
  ];
  const weight3 = 16;

  const kernel5 = [
    [1, 4, 6, 4, 1],
    [4, 16, 24, 16, 4],
    [6, 24, 36, 24, 6],
    [4, 16, 24, 16, 4],
    [1, 4, 6, 4, 1],
  ];
  const weight5 = 256;

  const k = kernelSize === 5 ? kernel5 : kernel3;
  const w = kernelSize === 5 ? weight5 : weight3;
  const radius = Math.floor(kernelSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx));
          const py = Math.min(height - 1, Math.max(0, y + ky));
          sum += gray[py * width + px] * k[ky + radius][kx + radius];
        }
      }
      output[y * width + x] = Math.round(sum / w);
    }
  }

  return output;
}

/**
 * Absolute Difference |I_ref - I_test|
 */
export function absoluteDifference(
  refGray: Uint8ClampedArray,
  testGray: Uint8ClampedArray
): Uint8ClampedArray {
  const diff = new Uint8ClampedArray(refGray.length);
  for (let i = 0; i < diff.length; i++) {
    diff[i] = Math.abs(refGray[i] - testGray[i]);
  }
  return diff;
}

/**
 * Otsu's Global Automatic Thresholding:
 * Maximizes between-class variance sigma_B^2(t).
 */
export function otsuThreshold(diff: Uint8ClampedArray): { binary: Uint8ClampedArray; threshold: number } {
  const hist = new Int32Array(256);
  for (let i = 0; i < diff.length; i++) {
    hist[diff[i]]++;
  }

  const total = diff.length;
  let sumB = 0;
  let wB = 0;
  let maximum = 0;
  let threshold = 0;

  let sum1 = 0;
  for (let i = 0; i < 256; i++) {
    sum1 += i * hist[i];
  }

  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;

    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum1 - sumB) / wF;

    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > maximum) {
      maximum = between;
      threshold = t;
    }
  }

  const binary = new Uint8ClampedArray(diff.length);
  for (let i = 0; i < diff.length; i++) {
    binary[i] = diff[i] >= threshold ? 255 : 0;
  }

  return { binary, threshold };
}

/**
 * Mathematical Morphology: Binary Erosion
 */
export function erode(binary: Uint8ClampedArray, width: number, height: number, size: 3 | 5 = 3): Uint8ClampedArray {
  const out = new Uint8ClampedArray(binary.length);
  const r = Math.floor(size / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let match = 255;
      for (let ky = -r; ky <= r; ky++) {
        for (let kx = -r; kx <= r; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx));
          const py = Math.min(height - 1, Math.max(0, y + ky));
          if (binary[py * width + px] === 0) {
            match = 0;
            break;
          }
        }
        if (match === 0) break;
      }
      out[y * width + x] = match;
    }
  }
  return out;
}

/**
 * Mathematical Morphology: Binary Dilation
 */
export function dilate(binary: Uint8ClampedArray, width: number, height: number, size: 3 | 5 = 3): Uint8ClampedArray {
  const out = new Uint8ClampedArray(binary.length);
  const r = Math.floor(size / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let match = 0;
      for (let ky = -r; ky <= r; ky++) {
        for (let kx = -r; kx <= r; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx));
          const py = Math.min(height - 1, Math.max(0, y + ky));
          if (binary[py * width + px] === 255) {
            match = 255;
            break;
          }
        }
        if (match === 255) break;
      }
      out[y * width + x] = match;
    }
  }
  return out;
}

/**
 * Morphological Opening (Erosion -> Dilation) followed by Closing (Dilation -> Erosion)
 */
export function morphologicalClean(
  binary: Uint8ClampedArray,
  width: number,
  height: number,
  size: 3 | 5 = 3
): Uint8ClampedArray {
  // Opening: removes isolated noise specks
  const opened = dilate(erode(binary, width, height, size), width, height, size);
  // Closing: bridges minor voids inside defect candidates
  const closed = erode(dilate(opened, width, height, size), width, height, size);
  return closed;
}

/**
 * Two-pass Connected Component Analysis with 8-connectivity to extract bounding boxes
 */
export function findConnectedComponents(
  binary: Uint8ClampedArray,
  width: number,
  height: number,
  minArea: number = 8,
  maxArea: number = 20000
): DIPCandidateBox[] {
  const visited = new Uint8Array(width * height);
  const boxes: DIPCandidateBox[] = [];

  // Breadth-First Search (BFS) flood-fill
  const queueX = new Int32Array(width * height);
  const queueY = new Int32Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (binary[idx] === 255 && !visited[idx]) {
        let head = 0;
        let tail = 0;

        queueX[tail] = x;
        queueY[tail] = y;
        tail++;
        visited[idx] = 1;

        let minX = x;
        let maxX = x;
        let minY = y;
        let maxY = y;
        let area = 0;

        while (head < tail) {
          const cx = queueX[head];
          const cy = queueY[head];
          head++;
          area++;

          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;

          // 8-neighborhood
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = cx + dx;
              const ny = cy + dy;

              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nIdx = ny * width + nx;
                if (binary[nIdx] === 255 && !visited[nIdx]) {
                  visited[nIdx] = 1;
                  queueX[tail] = nx;
                  queueY[tail] = ny;
                  tail++;
                }
              }
            }
          }
        }

        if (area >= minArea && area <= maxArea) {
          boxes.push({
            x: minX,
            y: minY,
            width: maxX - minX + 1,
            height: maxY - minY + 1,
            area,
          });
        }
      }
    }
  }

  return boxes;
}

/**
 * Execute full multi-stage classical DIP defect detection in the browser.
 */
export async function executeDIPPipeline(
  refCanvas: HTMLCanvasElement,
  testCanvas: HTMLCanvasElement,
  options: DIPOptions = {
    thresholdMethod: "otsu",
    fixedThresholdValue: 30,
    gaussianKernelSize: 3,
    morphologyKernelSize: 3,
    minDefectArea: 8,
    maxDefectArea: 25000,
  }
): Promise<DIPPipelineResult> {
  const t0 = performance.now();
  const width = testCanvas.width;
  const height = testCanvas.height;

  // Render both to internal contexts
  const refCtx = refCanvas.getContext("2d", { willReadFrequently: true });
  const testCtx = testCanvas.getContext("2d", { willReadFrequently: true });
  if (!refCtx || !testCtx) throw new Error("Could not acquire 2D canvas contexts");

  const refImgData = refCtx.getImageData(0, 0, width, height);
  const testImgData = testCtx.getImageData(0, 0, width, height);

  // 1. Grayscale
  const refGray = toGrayscale(refImgData.data);
  const testGray = toGrayscale(testImgData.data);

  // 2. Gaussian Blur
  const refSmooth = gaussianBlur(refGray, width, height, options.gaussianKernelSize || 3);
  const testSmooth = gaussianBlur(testGray, width, height, options.gaussianKernelSize || 3);

  // 3. Absolute Differencing
  const diff = absoluteDifference(refSmooth, testSmooth);

  // 4. Thresholding
  let binary: Uint8ClampedArray;
  if (options.thresholdMethod === "fixed") {
    const cutoff = options.fixedThresholdValue || 30;
    binary = new Uint8ClampedArray(diff.length);
    for (let i = 0; i < diff.length; i++) binary[i] = diff[i] >= cutoff ? 255 : 0;
  } else {
    // Otsu default
    const res = otsuThreshold(diff);
    binary = res.binary;
  }

  // 5. Morphological Cleanup (Opening + Closing)
  const cleaned = morphologicalClean(binary, width, height, options.morphologyKernelSize || 3);

  // 6. Connected Component Analysis
  const candidateBoxes = findConnectedComponents(
    cleaned,
    width,
    height,
    options.minDefectArea || 8,
    options.maxDefectArea || 25000
  );

  // Helper to convert Uint8ClampedArray to data URL
  const arrayToDataUrl = (arr: Uint8ClampedArray, w: number, h: number): string => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;
    const id = ctx.createImageData(w, h);
    for (let i = 0; i < arr.length; i++) {
      const val = arr[i];
      id.data[i * 4] = val;
      id.data[i * 4 + 1] = val;
      id.data[i * 4 + 2] = val;
      id.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(id, 0, 0);
    return c.toDataURL("image/png");
  };

  const diffCanvasUrl = arrayToDataUrl(diff, width, height);
  const thresholdCanvasUrl = arrayToDataUrl(binary, width, height);
  const cleanedCanvasUrl = arrayToDataUrl(cleaned, width, height);

  // Create annotated inspection canvas
  const annCanvas = document.createElement("canvas");
  annCanvas.width = width;
  annCanvas.height = height;
  const annCtx = annCanvas.getContext("2d")!;
  annCtx.drawImage(testCanvas, 0, 0);

  // Draw yellow candidate bounding boxes
  annCtx.lineWidth = 2;
  annCtx.strokeStyle = "#eab308";
  annCtx.fillStyle = "#eab308";
  annCtx.font = "bold 12px monospace";

  let totalArea = 0;
  candidateBoxes.forEach((box, i) => {
    totalArea += box.area;
    annCtx.strokeRect(box.x, box.y, box.width, box.height);
    annCtx.fillText(`Diff #${i + 1}`, box.x, Math.max(14, box.y - 4));
  });

  const annotatedCanvasUrl = annCanvas.toDataURL("image/png");
  const elapsed = performance.now() - t0;

  return {
    candidateBoxes,
    diffCanvasUrl,
    thresholdCanvasUrl,
    cleanedCanvasUrl,
    annotatedCanvasUrl,
    processingTimeMs: elapsed,
    totalCandidateArea: totalArea,
  };
}
