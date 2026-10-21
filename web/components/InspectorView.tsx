"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { YOLODetector, Detection, InferenceResult, DEFECT_COLORS, DEFECT_CLASSES } from "@/lib/inference/yolo-detector";
import {
  Upload,
  Play,
  RefreshCw,
  Download,
  FileSpreadsheet,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  SlidersHorizontal,
  Eye,
  EyeOff,
  ShieldCheck,
  Info,
} from "lucide-react";

const SAMPLES = [
  { id: "sample_1", name: "DeepPCB Sample 1", url: "/samples/pcb_sample_1_test.jpg", note: "Contains Open & Short defects" },
  { id: "sample_2", name: "DeepPCB Sample 2", url: "/samples/pcb_sample_2_test.jpg", note: "Contains Mouse Bite & Spur" },
  { id: "sample_3", name: "DeepPCB Sample 3", url: "/samples/pcb_sample_3_test.jpg", note: "Contains Spurious Cu & Pin Hole" },
  { id: "sample_4", name: "DeepPCB Sample 4", url: "/samples/pcb_sample_4_test.jpg", note: "Multi-defect evaluation board" },
];

export const InspectorView: React.FC = () => {
  const [detector, setDetector] = useState<YOLODetector | null>(null);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(true);
  const [isInferring, setIsInferring] = useState<boolean>(false);
  const [modelError, setModelError] = useState<string | null>(null);

  const [currentImageUrl, setCurrentImageUrl] = useState<string>(SAMPLES[0].url);
  const [imageName, setImageName] = useState<string>("00041000_test.jpg");
  const [confThreshold, setConfThreshold] = useState<number>(0.25);
  const [iouThreshold, setIouThreshold] = useState<number>(0.45);

  const [inferenceResult, setInferenceResult] = useState<InferenceResult | null>(null);
  const [hasRunDetection, setHasRunDetection] = useState<boolean>(false);

  // Optical Zoom & Pan State
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // View & Filter Controls
  const [showDetections, setShowDetections] = useState<boolean>(true);
  const [activeClasses, setActiveClasses] = useState<Record<string, boolean>>({
    open: true,
    short: true,
    mousebite: true,
    spur: true,
    copper: true,
    "pin-hole": true,
  });

  // Drag and drop state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  // Initialize YOLO detector on mount
  useEffect(() => {
    let isMounted = true;
    const yolo = new YOLODetector("/models/pcb_yolov8n.onnx");

    yolo
      .initialize()
      .then(() => {
        if (isMounted) {
          setDetector(yolo);
          setIsModelLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Model init error:", err);
          setModelError(String(err));
          setIsModelLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Redraw canvas with bounding boxes whenever detections, active classes, or visibility toggle changes
  const renderCanvas = useCallback(
    (img: HTMLImageElement, detections: Detection[], showBoxes: boolean, classFilter: Record<string, boolean>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;

      // Draw base PCB image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (!showBoxes) return;

      // Filter detections by active classes
      const visibleDetections = detections.filter((d) => classFilter[d.className] !== false);

      visibleDetections.forEach((det) => {
        const [x1, y1, x2, y2] = det.bbox;
        const w = x2 - x1;
        const h = y2 - y1;
        const color = det.color || "#ef4444";

        // Semi-transparent box fill
        ctx.fillStyle = `${color}25`;
        ctx.fillRect(x1, y1, w, h);

        // Box stroke with high-contrast outline
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = color;
        ctx.strokeRect(x1, y1, w, h);

        // Solid label badge
        const labelText = `${det.className.toUpperCase()} ${(det.confidence * 100).toFixed(1)}%`;
        ctx.font = "bold 13px 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        const textWidth = ctx.measureText(labelText).width;
        const badgeH = 20;
        const badgeW = textWidth + 12;
        const badgeY = y1 >= badgeH + 4 ? y1 - badgeH : y1;

        ctx.fillStyle = color;
        ctx.fillRect(x1, badgeY, badgeW, badgeH);

        ctx.fillStyle = "#ffffff";
        ctx.textBaseline = "middle";
        ctx.fillText(labelText, x1 + 6, badgeY + badgeH / 2);
      });
    },
    []
  );

  // Trigger canvas redraw on filter or toggle change
  useEffect(() => {
    if (imageElementRef.current && inferenceResult) {
      renderCanvas(imageElementRef.current, inferenceResult.detections, showDetections, activeClasses);
    }
  }, [showDetections, activeClasses, inferenceResult, renderCanvas]);

  // Run AI defect detection
  const runDetection = useCallback(async () => {
    if (!detector || !imageElementRef.current) return;
    setIsInferring(true);

    try {
      const res = await detector.detect(imageElementRef.current, confThreshold, iouThreshold);
      setInferenceResult(res);
      setHasRunDetection(true);
      setShowDetections(true);
      renderCanvas(imageElementRef.current, res.detections, true, activeClasses);
    } catch (err) {
      console.error("Inference failed:", err);
      alert(`Inference failed: ${err}`);
    } finally {
      setIsInferring(false);
    }
  }, [detector, confThreshold, iouThreshold, renderCanvas, activeClasses]);

  // Handle image load
  const onImageLoaded = () => {
    if (imageElementRef.current && canvasRef.current) {
      const img = imageElementRef.current;
      const canvas = canvasRef.current;
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      setInferenceResult(null);
      setHasRunDetection(false);
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
    }
  };

  // Handle sample selection
  const handleSelectSample = (sample: (typeof SAMPLES)[0]) => {
    setCurrentImageUrl(sample.url);
    setImageName(`${sample.id}.jpg`);
    setUploadError(null);
  };

  // Validate and load image file
  const processImageFile = (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith("image/")) {
      setUploadError("Please provide a valid image file (PNG, JPG, JPEG, WEBP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10 MB limit. Please provide an uncompressed or standard PCB scan.");
      return;
    }
    const url = URL.createObjectURL(file);
    setCurrentImageUrl(url);
    setImageName(file.name);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Zoom and Pan Handlers
  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => {
      const next = Math.max(1, Math.min(4, Number((prev + delta).toFixed(1))));
      if (next === 1) {
        setPanOffset({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && zoomLevel > 1) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Defect Class Filter Toggle
  const toggleClass = (cls: string) => {
    setActiveClasses((prev) => ({
      ...prev,
      [cls]: !prev[cls],
    }));
  };

  // Export functions
  const downloadAnnotatedImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `inspected_${imageName.replace(/\.[^/.]+$/, "")}.jpg`;
    link.href = canvasRef.current.toDataURL("image/jpeg", 0.95);
    link.click();
  };

  const downloadCSVReport = () => {
    if (!inferenceResult) return;
    const rows = [
      ["Defect #", "Class Name", "Confidence", "x1", "y1", "x2", "y2", "Width", "Height", "Area (px)"],
    ];
    inferenceResult.detections.forEach((d, i) => {
      const [x1, y1, x2, y2] = d.bbox;
      rows.push([
        String(i + 1),
        d.className,
        (d.confidence * 100).toFixed(2) + "%",
        x1.toFixed(1),
        y1.toFixed(1),
        x2.toFixed(1),
        y2.toFixed(1),
        (x2 - x1).toFixed(1),
        (y2 - y1).toFixed(1),
        ((x2 - x1) * (y2 - y1)).toFixed(0),
      ]);
    });
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `pcb_defects_${imageName.replace(/\.[^/.]+$/, "")}.csv`);
    link.click();
  };

  const downloadJSONReport = () => {
    if (!inferenceResult) return;
    const report = {
      system: "PCB Vision AI — Intelligent Automated PCB Inspection System",
      version: "2.0.0",
      architecture: "YOLOv8n ONNX Runtime Web (WASM SIMD)",
      timestamp: new Date().toISOString(),
      inspectedImage: imageName,
      detectionSummary: {
        totalDefects: inferenceResult.detections.length,
        verdict:
          inferenceResult.detections.length === 0
            ? "NO_ANOMALIES_DETECTED_WITHIN_THRESHOLD"
            : "SURFACE_ANOMALIES_LOCALIZED",
        disclaimer:
          "Notice: Optical automated surface defect detection does not substitute for in-circuit bed-of-nails continuity testing.",
      },
      thresholds: {
        confidenceCutoff: confThreshold,
        nmsIoUCutoff: iouThreshold,
      },
      latency: {
        preprocessMs: Number(inferenceResult.preprocessTimeMs.toFixed(2)),
        inferenceMs: Number(inferenceResult.inferenceTimeMs.toFixed(2)),
        postprocessMs: Number(inferenceResult.postprocessTimeMs.toFixed(2)),
        totalMs: Number(inferenceResult.totalTimeMs.toFixed(2)),
      },
      detections: inferenceResult.detections.map((d) => ({
        classId: d.classId,
        className: d.className,
        confidence: Number((d.confidence * 100).toFixed(2)),
        bbox: d.bbox.map((v) => Number(v.toFixed(1))),
      })),
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `pcb_inspection_report_${imageName.replace(/\.[^/.]+$/, "")}.json`);
    link.click();
  };

  const defectCount = inferenceResult ? inferenceResult.detections.length : 0;
  const visibleCount = inferenceResult
    ? inferenceResult.detections.filter((d) => activeClasses[d.className] !== false).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Model Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              AI Deep Learning PCB Inspector
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
              YOLOv8n ONNX
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Real-time, single-image multi-class defect classification with client-side WebAssembly execution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isModelLoading ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Initializing ONNX Session (12.2 MB)...</span>
            </div>
          ) : modelError ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Model Error: {modelError}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Model Ready (WASM SIMD)</span>
            </div>
          )}
        </div>
      </div>

      {/* Control Panel: Drag & Drop Dropzone, Samples, Tuning Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Source Selection & Drag-and-Drop Dropzone */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2 font-mono">
            <Layers className="w-4 h-4 text-emerald-400" /> Image Source Selection
          </h2>

          {/* Sample Selector Buttons */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400">Authentic DeepPCB Test Boards:</span>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`text-xs px-3 py-2.5 rounded-xl border text-left truncate transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                    currentImageUrl === sample.url
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold shadow-sm"
                      : "bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700"
                  }`}
                  aria-label={`Select ${sample.name}`}
                >
                  <div className="font-semibold">{sample.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{sample.note}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-4 text-center transition cursor-pointer ${
              isDragging
                ? "border-emerald-400 bg-emerald-500/10"
                : "border-slate-700 bg-slate-950/40 hover:border-slate-600 hover:bg-slate-950/60"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              aria-label="Upload custom PCB scan image"
            />
            <div className="flex flex-col items-center gap-2">
              <Upload className={`w-5 h-5 ${isDragging ? "text-emerald-400" : "text-slate-400"}`} />
              <div className="text-xs font-medium text-slate-200">
                <span>Drag &amp; drop PCB image, or </span>
                <span className="text-emerald-400 underline">browse files</span>
              </div>
              <div className="text-[10px] text-slate-500">
                Supports PNG, JPG, WEBP (Max 10 MB)
              </div>
            </div>
          </div>

          {uploadError && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* Hyperparameter Tuning */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2 font-mono">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" /> Detection Hyperparameters
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label htmlFor="confThresholdInput" className="text-slate-400">
                Confidence Threshold:
              </label>
              <span className="text-emerald-400 font-mono font-bold">{(confThreshold * 100).toFixed(0)}%</span>
            </div>
            <input
              id="confThresholdInput"
              type="range"
              min="0.05"
              max="0.95"
              step="0.05"
              value={confThreshold}
              onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label="Confidence threshold slider"
            />
            <p className="text-[11px] text-slate-500">Rejects low-confidence anchor box predictions.</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between text-xs">
              <label htmlFor="iouThresholdInput" className="text-slate-400">
                NMS IoU Overlap Cutoff:
              </label>
              <span className="text-emerald-400 font-mono font-bold">{(iouThreshold * 100).toFixed(0)}%</span>
            </div>
            <input
              id="iouThresholdInput"
              type="range"
              min="0.10"
              max="0.90"
              step="0.05"
              value={iouThreshold}
              onChange={(e) => setIouThreshold(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label="NMS IoU threshold slider"
            />
            <p className="text-[11px] text-slate-500">Suppresses redundant candidate anchors for the same defect.</p>
          </div>
        </div>

        {/* Execution & Action Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" /> Client-Side Execution
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Execution runs purely in your local browser sandbox via WebAssembly SIMD. No image bytes or telemetry are ever transmitted to any external server.
            </p>
          </div>

          <button
            onClick={runDetection}
            disabled={isModelLoading || isInferring}
            className={`w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm transition shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              isInferring || isModelLoading
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-950/40 transform active:scale-95"
            }`}
            aria-label="Run AI PCB Defect Detection"
          >
            {isInferring ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running ONNX Inference...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run PCB Defect Inspection</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Inspection View: Interactive Canvas & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas Display (3 cols) with Zoom & Pan Toolbar */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-between overflow-hidden min-h-[540px]">
          {/* Canvas Header & Interactive Controls Bar */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400 font-mono">
              <span className="text-slate-200 font-bold">{imageName}</span>
              {hasRunDetection && (
                <span className="text-emerald-400">
                  • {imageElementRef.current?.naturalWidth || 640}×{imageElementRef.current?.naturalHeight || 640} px
                </span>
              )}
            </div>

            {/* Canvas Toolbar: Zoom, Reset, Toggle Bounding Boxes */}
            <div className="flex items-center gap-2">
              {hasRunDetection && (
                <button
                  onClick={() => setShowDetections(!showDetections)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition ${
                    showDetections
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                  aria-label="Toggle defect annotations on canvas"
                >
                  {showDetections ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{showDetections ? "Boxes On" : "Boxes Off"}</span>
                </button>
              )}

              {/* Zoom In / Out / Reset Controls */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 font-mono">
                <button
                  onClick={() => handleZoom(-0.5)}
                  disabled={zoomLevel <= 1}
                  className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-[11px] text-slate-300 font-semibold">{zoomLevel.toFixed(1)}x</span>
                <button
                  onClick={() => handleZoom(0.5)}
                  disabled={zoomLevel >= 4}
                  className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                {zoomLevel > 1 && (
                  <button
                    onClick={resetZoom}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 border-l border-slate-800 transition"
                    aria-label="Reset zoom to fit"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Canvas Viewport Container */}
          <div
            ref={canvasContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`w-full relative border border-slate-800 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center p-2 min-h-[440px] ${
              zoomLevel > 1 ? (isPanning ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
            }`}
          >
            <div
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: "center center",
                transition: isPanning ? "none" : "transform 0.15s ease-out",
              }}
            >
              <canvas ref={canvasRef} className="max-w-full h-auto rounded shadow-2xl block" />
            </div>

            {/* Hidden image element to load source */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageElementRef}
              src={currentImageUrl}
              alt="Inspected PCB Target Surface"
              crossOrigin="anonymous"
              onLoad={onImageLoaded}
              className="hidden"
            />
          </div>

          {/* Per-Class Defect Filter Checkboxes */}
          {hasRunDetection && (
            <div className="w-full mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Class Filter:</span>
              <div className="flex flex-wrap gap-2">
                {DEFECT_CLASSES.map((cls) => {
                  const color = DEFECT_COLORS[cls] || "#ef4444";
                  const isChecked = activeClasses[cls] !== false;
                  return (
                    <button
                      key={cls}
                      onClick={() => toggleClass(cls)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-mono border transition ${
                        isChecked
                          ? "bg-slate-800 text-white border-slate-600"
                          : "bg-slate-950 text-slate-500 border-slate-800 line-through opacity-60"
                      }`}
                      aria-label={`Toggle visibility of ${cls} defect class`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="capitalize">{cls}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Metrics, Telemetry & Quality Verdict Sidebar (1 col) */}
        <div className="space-y-4">
          {/* Quality Status Card */}
          <div
            className={`p-5 rounded-2xl border ${
              !hasRunDetection
                ? "bg-slate-900 border-slate-800 text-slate-400"
                : defectCount === 0
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            }`}
          >
            <div className="text-[11px] uppercase tracking-wider font-semibold font-mono">
              Diagnostic Verdict
            </div>
            <div className="text-xl font-extrabold mt-1">
              {!hasRunDetection
                ? "AWAITING INSPECTION"
                : defectCount === 0
                ? "NO ANOMALIES DETECTED"
                : `${defectCount} SURFACE ANOMALIES`}
            </div>
            <p className="text-xs mt-1.5 text-slate-300 leading-relaxed">
              {!hasRunDetection
                ? "Select a test board and trigger inspection to detect anomalies."
                : defectCount === 0
                ? "No surface trace anomalies detected within model threshold and DeepPCB domain."
                : `${defectCount} surface defects localized (${visibleCount} active in view). Check inventory table below.`}
            </p>

            {hasRunDetection && (
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Optical inspection does not certify electrical continuity.</span>
              </div>
            )}
          </div>

          {/* Performance Telemetry */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Latency Telemetry
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                <span>Preprocessing:</span>
                <span className="text-white">
                  {inferenceResult ? `${inferenceResult.preprocessTimeMs.toFixed(1)} ms` : "—"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                <span>ONNX Web WASM:</span>
                <span className="text-emerald-400 font-bold">
                  {inferenceResult ? `${inferenceResult.inferenceTimeMs.toFixed(1)} ms` : "—"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                <span>Decoupled NMS:</span>
                <span className="text-white">
                  {inferenceResult ? `${inferenceResult.postprocessTimeMs.toFixed(1)} ms` : "—"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-300 font-semibold">
                <span>Total Latency:</span>
                <span className="text-emerald-400">
                  {inferenceResult ? `${inferenceResult.totalTimeMs.toFixed(1)} ms` : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Color Taxonomy Legend */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 font-mono">
              Defect Color Taxonomy
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {Object.entries(DEFECT_COLORS).map(([name, col]) => (
                <div key={name} className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col }} />
                  <span className="capitalize truncate text-[11px]">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Defect Inventory Table & Export Toolbar */}
      {inferenceResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Detected Defect Inventory ({defectCount} Records)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Bounding box coordinates normalized to original source resolution.
              </p>
            </div>

            {/* Export Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={downloadAnnotatedImage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                aria-label="Export annotated inspection JPG"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Annotated JPG</span>
              </button>

              <button
                onClick={downloadCSVReport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                aria-label="Export defect inventory CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Defect CSV</span>
              </button>

              <button
                onClick={downloadJSONReport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                aria-label="Export inspection report JSON"
              >
                <FileJson className="w-3.5 h-3.5" />
                <span>Inspection Report JSON</span>
              </button>
            </div>
          </div>

          {defectCount > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Classification</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3">Bounding Box (x1, y1, x2, y2)</th>
                    <th className="py-2.5 px-3">Dimensions (W × H)</th>
                    <th className="py-2.5 px-3">Area</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {inferenceResult.detections.map((det, idx) => {
                    const [x1, y1, x2, y2] = det.bbox;
                    const w = x2 - x1;
                    const h = y2 - y1;
                    return (
                      <tr key={idx} className="hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-3 text-slate-500 font-bold">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className="inline-block px-2 py-0.5 rounded font-bold uppercase text-[11px]"
                            style={{
                              backgroundColor: `${det.color}20`,
                              color: det.color,
                              border: `1px solid ${det.color}40`,
                            }}
                          >
                            {det.className}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-white font-semibold">
                          {(det.confidence * 100).toFixed(2)}%
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          ({x1.toFixed(0)}, {y1.toFixed(0)}, {x2.toFixed(0)}, {y2.toFixed(0)})
                        </td>
                        <td className="py-2.5 px-3">
                          {w.toFixed(0)} × {h.toFixed(0)} px
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{(w * h).toFixed(0)} px²</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs">
              No defect bounding boxes were detected above the {(confThreshold * 100).toFixed(0)}% confidence threshold.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
