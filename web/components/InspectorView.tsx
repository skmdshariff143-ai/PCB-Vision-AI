"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { YOLODetector, Detection, InferenceResult, DEFECT_COLORS } from "@/lib/inference/yolo-detector";
import { Upload, Play, RefreshCw, Download, FileSpreadsheet, FileJson, CheckCircle2, AlertTriangle, Cpu, Layers } from "lucide-react";

const SAMPLES = [
  { id: "sample_1", name: "PCB Board 00041 #0", url: "/samples/pcb_sample_1_test.jpg" },
  { id: "sample_2", name: "PCB Board 00041 #1", url: "/samples/pcb_sample_2_test.jpg" },
  { id: "sample_3", name: "PCB Board 00041 #2", url: "/samples/pcb_sample_3_test.jpg" },
  { id: "sample_4", name: "PCB Board 00041 #3", url: "/samples/pcb_sample_4_test.jpg" },
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

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Redraw canvas with bounding boxes whenever detections, image, or thresholds change
  const renderCanvas = useCallback((img: HTMLImageElement, detections: Detection[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    // Draw base image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw detected defect boxes
    detections.forEach((det) => {
      const [x1, y1, x2, y2] = det.bbox;
      const w = x2 - x1;
      const h = y2 - y1;
      const color = det.color || "#ef4444";

      // Semi-transparent box fill
      ctx.fillStyle = `${color}25`;
      ctx.fillRect(x1, y1, w, h);

      // Box stroke
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = color;
      ctx.strokeRect(x1, y1, w, h);

      // Label badge
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
  }, []);

  // Run AI defect detection
  const runDetection = useCallback(async () => {
    if (!detector || !imageElementRef.current) return;
    setIsInferring(true);

    try {
      const res = await detector.detect(imageElementRef.current, confThreshold, iouThreshold);
      setInferenceResult(res);
      setHasRunDetection(true);
      renderCanvas(imageElementRef.current, res.detections);
    } catch (err) {
      console.error("Inference failed:", err);
      alert(`Inference failed: ${err}`);
    } finally {
      setIsInferring(false);
    }
  }, [detector, confThreshold, iouThreshold, renderCanvas]);

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
    }
  };

  // Handle sample selection
  const handleSelectSample = (sample: typeof SAMPLES[0]) => {
    setCurrentImageUrl(sample.url);
    setImageName(`${sample.id}.jpg`);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please upload a valid image file (PNG, JPG, JPEG).");
        return;
      }
      const url = URL.createObjectURL(file);
      setCurrentImageUrl(url);
      setImageName(file.name);
    }
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

  const downloadJSONCertificate = () => {
    if (!inferenceResult) return;
    const cert = {
      system: "PCB Vision AI — Intelligent Automated PCB Inspection System",
      version: "1.0.0",
      architecture: "YOLOv8n ONNX Runtime Web (WASM)",
      timestamp: new Date().toISOString(),
      inspectedImage: imageName,
      qualityVerdict: inferenceResult.detections.length === 0 ? "PASS" : "FAIL",
      defectCount: inferenceResult.detections.length,
      thresholds: {
        confidence: confThreshold,
        nmsIoU: iouThreshold,
      },
      latency: {
        preprocessMs: inferenceResult.preprocessTimeMs,
        inferenceMs: inferenceResult.inferenceTimeMs,
        postprocessMs: inferenceResult.postprocessTimeMs,
        totalMs: inferenceResult.totalTimeMs,
      },
      detections: inferenceResult.detections,
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cert, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `pcb_inspection_certificate_${imageName.replace(/\.[^/.]+$/, "")}.json`);
    link.click();
  };

  const defectCount = inferenceResult ? inferenceResult.detections.length : 0;
  const isPass = hasRunDetection && defectCount === 0;
  const isFail = hasRunDetection && defectCount > 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Model Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            🔬 AI Deep Learning PCB Inspector
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time, single-image multi-class defect classification powered by client-side YOLOv8 ONNX Web.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isModelLoading ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Loading ONNX Model (12.2 MB)...</span>
            </div>
          ) : modelError ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Model Error: {modelError}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>YOLOv8n ONNX Engine Ready</span>
            </div>
          )}
        </div>
      </div>

      {/* Control Panel: Samples & Tuning Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sample Selection & File Upload */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" /> Image Source Selection
          </h2>

          <div className="space-y-2">
            <span className="text-xs text-slate-400">Load Authentic DeepPCB Test Board:</span>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`text-xs px-2.5 py-2 rounded-lg border text-left truncate transition ${
                    currentImageUrl === sample.url
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-medium"
                      : "bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition"
            >
              <Upload className="w-4 h-4 text-slate-400" />
              <span>Upload Custom PCB Scan</span>
            </button>
          </div>
        </div>

        {/* Hyperparameter Tuning */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" /> Detection Hyperparameters
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Confidence Threshold:</span>
              <span className="text-emerald-400 font-mono font-semibold">{(confThreshold * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.95"
              step="0.05"
              value={confThreshold}
              onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <p className="text-[11px] text-slate-500">Filters predictions below this probability cutoff.</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">NMS IoU Overlap Cutoff:</span>
              <span className="text-emerald-400 font-mono font-semibold">{(iouThreshold * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.90"
              step="0.05"
              value={iouThreshold}
              onChange={(e) => setIouThreshold(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <p className="text-[11px] text-slate-500">Suppresses duplicate overlapping bounding boxes.</p>
          </div>
        </div>

        {/* Action Button & Quality Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Inspection Execution
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Executes client-side WASM inference. Processing occurs entirely in your browser; no images are uploaded to any server.
            </p>
          </div>

          <button
            onClick={runDetection}
            disabled={isModelLoading || isInferring}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition shadow-lg ${
              isInferring || isModelLoading
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-emerald-500/20"
            }`}
          >
            {isInferring ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Inference...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run PCB Inspection</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Inspection View: Image Canvas & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas Display (3 cols) */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center overflow-hidden min-h-[500px]">
          <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-400">
            <span className="font-mono">Inspection Canvas: {imageName}</span>
            {hasRunDetection && (
              <span className="font-mono text-emerald-400">
                Resolution: {imageElementRef.current?.naturalWidth || 640} × {imageElementRef.current?.naturalHeight || 640} px
              </span>
            )}
          </div>

          <div className="relative border border-slate-800 rounded-lg overflow-auto max-h-[620px] bg-slate-950 flex items-center justify-center p-2">
            <canvas ref={canvasRef} className="max-w-full h-auto rounded shadow-inner" />
            {/* Hidden image element to load source */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageElementRef}
              src={currentImageUrl}
              alt="PCB Target"
              crossOrigin="anonymous"
              onLoad={onImageLoaded}
              className="hidden"
            />
          </div>
        </div>

        {/* Metrics & Quality Verdict Sidebar (1 col) */}
        <div className="space-y-4">
          {/* Quality Banner */}
          <div
            className={`p-5 rounded-xl border ${
              isPass
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : isFail
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
          >
            <div className="text-xs uppercase tracking-wider font-semibold">Quality Status</div>
            <div className="text-2xl font-bold mt-1">
              {isPass ? "PASS (CLEAN)" : isFail ? `FAIL (${defectCount} DEFECTS)` : "READY"}
            </div>
            <p className="text-xs mt-1 text-slate-400">
              {isPass
                ? "Zero anomalies detected above confidence threshold."
                : isFail
                ? "Surface defects localized on board. Quarantine unit."
                : "Select an image and click Run PCB Inspection."}
            </p>
          </div>

          {/* Performance Telemetry */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Inference Telemetry
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                <span>Preprocessing:</span>
                <span className="text-white">
                  {inferenceResult ? `${inferenceResult.preprocessTimeMs.toFixed(1)} ms` : "—"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                <span>ONNX Forward Pass:</span>
                <span className="text-emerald-400 font-bold">
                  {inferenceResult ? `${inferenceResult.inferenceTimeMs.toFixed(1)} ms` : "—"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                <span>Postprocess (NMS):</span>
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

          {/* Class Legend */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Defect Color Legend
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(DEFECT_COLORS).map(([name, col]) => (
                <div key={name} className="flex items-center gap-2 text-slate-300">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: col }} />
                  <span className="capitalize">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Defect Inventory Table & Export Toolbar */}
      {inferenceResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                📋 Detected Defect Inventory ({defectCount} Records)
              </h2>
              <p className="text-xs text-slate-400">
                Detailed coordinate coordinates and confidence ratings for verified anomalies.
              </p>
            </div>

            {/* Export Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={downloadAnnotatedImage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Annotated JPG</span>
              </button>

              <button
                onClick={downloadCSVReport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Defect CSV</span>
              </button>

              <button
                onClick={downloadJSONCertificate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition"
              >
                <FileJson className="w-3.5 h-3.5" />
                <span>Certificate JSON</span>
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
                    <th className="py-2.5 px-3">Dimension (W × H)</th>
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
                        <td className="py-2 px-3 text-slate-500 font-bold">{idx + 1}</td>
                        <td className="py-2 px-3">
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
                        <td className="py-2 px-3 text-white font-semibold">
                          {(det.confidence * 100).toFixed(2)}%
                        </td>
                        <td className="py-2 px-3 text-slate-400">
                          ({x1.toFixed(0)}, {y1.toFixed(0)}, {x2.toFixed(0)}, {y2.toFixed(0)})
                        </td>
                        <td className="py-2 px-3">
                          {w.toFixed(0)} × {h.toFixed(0)} px
                        </td>
                        <td className="py-2 px-3 text-slate-400">{(w * h).toFixed(0)} px²</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs">
              No defect bounding boxes were detected above the {confThreshold * 100}% confidence threshold.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
