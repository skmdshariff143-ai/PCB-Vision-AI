/**
 * PCB Vision AI — Client-Side YOLOv8 ONNX Inference Engine
 * --------------------------------------------------------
 * High-performance, client-side browser object detection using ONNX Runtime Web.
 * Fully decoupled preprocessing, letterboxing, tensor decoding, and class-aware NMS.
 */

import type * as OrtTypes from "onnxruntime-web";
import { DEFECT_CLASSES, DEFECT_COLORS } from "@/lib/constants";

export interface Detection {
  classId: number;
  className: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
  color: string;
}

export interface InferenceResult {
  detections: Detection[];
  inferenceTimeMs: number;
  preprocessTimeMs: number;
  postprocessTimeMs: number;
  totalTimeMs: number;
  inputWidth: number;
  inputHeight: number;
}

export { DEFECT_CLASSES, DEFECT_COLORS };

export class YOLODetector {
  private session: OrtTypes.InferenceSession | null = null;
  private ort: typeof OrtTypes | null = null;
  private modelUrl: string;
  private isInitializing: boolean = false;

  constructor(modelUrl: string = "/models/pcb_yolov8n.onnx") {
    this.modelUrl = modelUrl;
  }

  private async getOrt(): Promise<typeof OrtTypes> {
    if (!this.ort) {
      if (typeof window === "undefined") {
        throw new Error("ONNX Runtime Web must be executed in a browser environment");
      }
      this.ort = await import("onnxruntime-web");
    }
    return this.ort;
  }

  public async initialize(): Promise<void> {
    if (this.session) return;
    if (this.isInitializing) {
      while (this.isInitializing) {
        await new Promise((r) => setTimeout(r, 100));
      }
      return;
    }

    this.isInitializing = true;
    try {
      const ort = await this.getOrt();

      // Configure ONNX Runtime Web environment
      ort.env.wasm.numThreads = Math.min(4, typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 2 : 2);
      ort.env.wasm.simd = true;

      // Point WASM assets to reliable CDN fallback
      ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/";

      const options: OrtTypes.InferenceSession.SessionOptions = {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
      };

      this.session = await ort.InferenceSession.create(this.modelUrl, options);
      console.log("[YOLO] ONNX Runtime session created successfully:", this.modelUrl);
    } catch (err) {
      console.error("[YOLO] Failed to load ONNX model:", err);
      throw new Error(`Failed to load model from ${this.modelUrl}: ${err}`);
    } finally {
      this.isInitializing = false;
    }
  }

  public isLoaded(): boolean {
    return this.session !== null;
  }

  /**
   * Preprocess HTMLImageElement / HTMLCanvasElement:
   * Scales to 640x640 with aspect-ratio preserved letterboxing (padding).
   * Normalizes pixels to [0.0, 1.0] in RGB NCHW layout.
   */
  private async preprocess(
    img: HTMLImageElement | HTMLCanvasElement
  ): Promise<{ tensor: OrtTypes.Tensor; ratio: number; padW: number; padH: number; origW: number; origH: number }> {
    const ort = await this.getOrt();
    const origW = img instanceof HTMLImageElement ? img.naturalWidth : img.width;
    const origH = img instanceof HTMLImageElement ? img.naturalHeight : img.height;

    const targetSize = 640;
    const r = Math.min(targetSize / origH, targetSize / origW);
    const unpadW = Math.round(origW * r);
    const unpadH = Math.round(origH * r);
    const padW = (targetSize - unpadW) / 2;
    const padH = (targetSize - unpadH) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Could not obtain canvas 2D context");

    // Fill letterbox canvas with neutral gray (RGB 114, 114, 114)
    ctx.fillStyle = "rgb(114, 114, 114)";
    ctx.fillRect(0, 0, targetSize, targetSize);

    // Draw scaled image centered
    ctx.drawImage(img, Math.round(padW), Math.round(padH), unpadW, unpadH);

    const imgData = ctx.getImageData(0, 0, targetSize, targetSize);
    const { data } = imgData;

    // Convert RGBA HWC -> RGB NCHW Float32Array normalized [0, 1]
    const float32Data = new Float32Array(3 * targetSize * targetSize);
    const planeSize = targetSize * targetSize;

    for (let i = 0; i < planeSize; i++) {
      const rVal = data[i * 4] / 255.0;
      const gVal = data[i * 4 + 1] / 255.0;
      const bVal = data[i * 4 + 2] / 255.0;

      float32Data[i] = rVal; // Channel 0: R
      float32Data[planeSize + i] = gVal; // Channel 1: G
      float32Data[2 * planeSize + i] = bVal; // Channel 2: B
    }

    const tensor = new ort.Tensor("float32", float32Data, [1, 3, targetSize, targetSize]);
    return { tensor, ratio: r, padW, padH, origW, origH };
  }

  /**
   * Run inference on an image and return decoded defect detections.
   */
  public async detect(
    image: HTMLImageElement | HTMLCanvasElement,
    confThreshold: number = 0.25,
    iouThreshold: number = 0.45
  ): Promise<InferenceResult> {
    if (!this.session) {
      await this.initialize();
    }
    if (!this.session) {
      throw new Error("Inference session could not be established");
    }

    const t0 = performance.now();
    const { tensor, ratio, padW, padH, origW, origH } = await this.preprocess(image);
    const tPre = performance.now();

    const feeds: Record<string, OrtTypes.Tensor> = {};
    feeds[this.session.inputNames[0]] = tensor;

    const tInfStart = performance.now();
    const results = await this.session.run(feeds);
    const tInfEnd = performance.now();

    const outputTensor = results[this.session.outputNames[0]];
    const rawData = outputTensor.data as Float32Array; // shape: [1, 10, 8400]

    const tPostStart = performance.now();
    const detections = this.postprocess(
      rawData,
      ratio,
      padW,
      padH,
      origW,
      origH,
      confThreshold,
      iouThreshold
    );
    const tPostEnd = performance.now();

    return {
      detections,
      preprocessTimeMs: tPre - t0,
      inferenceTimeMs: tInfEnd - tInfStart,
      postprocessTimeMs: tPostEnd - tPostStart,
      totalTimeMs: tPostEnd - t0,
      inputWidth: origW,
      inputHeight: origH,
    };
  }

  private postprocess(
    data: Float32Array,
    ratio: number,
    padW: number,
    padH: number,
    origW: number,
    origH: number,
    confThreshold: number,
    iouThreshold: number
  ): Detection[] {
    const numAnchors = 8400;
    const numClasses = 6;
    const candidates: Array<{
      classId: number;
      score: number;
      bbox: [number, number, number, number];
    }> = [];

    // Data layout in YOLOv8: [1, 10, 8400]
    // row 0: cx
    // row 1: cy
    // row 2: w
    // row 3: h
    // row 4..9: class probabilities
    for (let i = 0; i < numAnchors; i++) {
      let maxScore = -1;
      let maxCls = -1;

      for (let c = 0; c < numClasses; c++) {
        const score = data[(4 + c) * numAnchors + i];
        if (score > maxScore) {
          maxScore = score;
          maxCls = c;
        }
      }

      if (maxScore >= confThreshold) {
        const cx = data[0 * numAnchors + i];
        const cy = data[1 * numAnchors + i];
        const w = data[2 * numAnchors + i];
        const h = data[3 * numAnchors + i];

        // Box corners on letterboxed 640x640 canvas
        const bx1 = cx - w / 2;
        const by1 = cy - h / 2;
        const bx2 = cx + w / 2;
        const by2 = cy + h / 2;

        // Invert letterbox scaling back to original coordinate system
        const x1 = Math.max(0, Math.min(origW, (bx1 - padW) / ratio));
        const y1 = Math.max(0, Math.min(origH, (by1 - padH) / ratio));
        const x2 = Math.max(0, Math.min(origW, (bx2 - padW) / ratio));
        const y2 = Math.max(0, Math.min(origH, (by2 - padH) / ratio));

        if (x2 > x1 && y2 > y1) {
          candidates.push({
            classId: maxCls,
            score: maxScore,
            bbox: [x1, y1, x2, y2],
          });
        }
      }
    }

    // Sort by confidence descending
    candidates.sort((a, b) => b.score - a.score);

    // Class-aware Non-Maximum Suppression (NMS)
    const finalDetections: Detection[] = [];
    const suppressed = new Uint8Array(candidates.length);

    for (let i = 0; i < candidates.length; i++) {
      if (suppressed[i]) continue;
      const a = candidates[i];
      const className = DEFECT_CLASSES[a.classId] || `class_${a.classId}`;

      finalDetections.push({
        classId: a.classId,
        className,
        confidence: a.score,
        bbox: a.bbox,
        color: DEFECT_COLORS[className] || "#3b82f6",
      });

      for (let j = i + 1; j < candidates.length; j++) {
        if (suppressed[j]) continue;
        const b = candidates[j];
        if (a.classId === b.classId) {
          const iou = this.computeIoU(a.bbox, b.bbox);
          if (iou >= iouThreshold) {
            suppressed[j] = 1;
          }
        }
      }
    }

    return finalDetections;
  }

  private computeIoU(
    boxA: [number, number, number, number],
    boxB: [number, number, number, number]
  ): number {
    const xA = Math.max(boxA[0], boxB[0]);
    const yA = Math.max(boxA[1], boxB[1]);
    const xB = Math.min(boxA[2], boxB[2]);
    const yB = Math.min(boxA[3], boxB[3]);

    const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
    const boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1]);
    const boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1]);
    const unionArea = boxAArea + boxBArea - interArea;

    return unionArea > 0 ? interArea / unionArea : 0;
  }
}
