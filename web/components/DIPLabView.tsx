"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { executeDIPPipeline, DIPPipelineResult, DIPOptions } from "@/lib/image-processing/classical-dip";
import { Cpu, Play, RefreshCw, AlertCircle, Layers } from "lucide-react";

const SAMPLES = [
  {
    id: "sample_1",
    name: "DeepPCB Pair 00041 #0",
    testUrl: "/samples/pcb_sample_1_test.jpg",
    refUrl: "/samples/pcb_sample_1_temp.jpg",
  },
  {
    id: "sample_2",
    name: "DeepPCB Pair 00041 #1",
    testUrl: "/samples/pcb_sample_2_test.jpg",
    refUrl: "/samples/pcb_sample_2_temp.jpg",
  },
  {
    id: "sample_3",
    name: "DeepPCB Pair 00041 #2",
    testUrl: "/samples/pcb_sample_3_test.jpg",
    refUrl: "/samples/pcb_sample_3_temp.jpg",
  },
  {
    id: "sample_4",
    name: "DeepPCB Pair 00041 #3",
    testUrl: "/samples/pcb_sample_4_test.jpg",
    refUrl: "/samples/pcb_sample_4_temp.jpg",
  },
];

export const DIPLabView: React.FC = () => {
  const [selectedSample, setSelectedSample] = useState<typeof SAMPLES[0]>(SAMPLES[0]);
  const [testImgUrl, setTestImgUrl] = useState<string>(SAMPLES[0].testUrl);
  const [refImgUrl, setRefImgUrl] = useState<string>(SAMPLES[0].refUrl);

  const [thresholdMethod, setThresholdMethod] = useState<"otsu" | "fixed">("otsu");
  const [fixedCutoff, setFixedCutoff] = useState<number>(30);
  const [gaussianKernel, setGaussianKernel] = useState<3 | 5>(3);
  const [minDefectArea, setMinDefectArea] = useState<number>(8);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [dipResult, setDipResult] = useState<DIPPipelineResult | null>(null);

  const testCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const refCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load sample pair into hidden canvases
  const loadImagesToCanvas = useCallback(() => {
    const testImg = new Image();
    testImg.crossOrigin = "anonymous";
    testImg.src = testImgUrl;

    const refImg = new Image();
    refImg.crossOrigin = "anonymous";
    refImg.src = refImgUrl;

    let loadedCount = 0;
    const checkBothLoaded = () => {
      loadedCount++;
      if (loadedCount === 2) {
        if (testCanvasRef.current && refCanvasRef.current) {
          const w = testImg.naturalWidth || 640;
          const h = testImg.naturalHeight || 640;

          testCanvasRef.current.width = w;
          testCanvasRef.current.height = h;
          const testCtx = testCanvasRef.current.getContext("2d");
          testCtx?.drawImage(testImg, 0, 0, w, h);

          refCanvasRef.current.width = w;
          refCanvasRef.current.height = h;
          const refCtx = refCanvasRef.current.getContext("2d");
          refCtx?.drawImage(refImg, 0, 0, w, h);

          setDipResult(null);
        }
      }
    };

    testImg.onload = checkBothLoaded;
    refImg.onload = checkBothLoaded;
  }, [testImgUrl, refImgUrl]);

  useEffect(() => {
    loadImagesToCanvas();
  }, [loadImagesToCanvas]);

  const handleSelectSample = (sample: typeof SAMPLES[0]) => {
    setSelectedSample(sample);
    setTestImgUrl(sample.testUrl);
    setRefImgUrl(sample.refUrl);
  };

  const runClassicalPipeline = async () => {
    if (!testCanvasRef.current || !refCanvasRef.current) return;
    setIsProcessing(true);

    try {
      const options: DIPOptions = {
        thresholdMethod,
        fixedThresholdValue: fixedCutoff,
        gaussianKernelSize: gaussianKernel,
        morphologyKernelSize: 3,
        minDefectArea,
        maxDefectArea: 25000,
      };

      const result = await executeDIPPipeline(refCanvasRef.current, testCanvasRef.current, options);
      setDipResult(result);
    } catch (err) {
      console.error("DIP Pipeline failed:", err);
      alert(`DIP Pipeline failed: ${err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden canvases for processing */}
      <canvas ref={testCanvasRef} className="hidden" />
      <canvas ref={refCanvasRef} className="hidden" />

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          ⚙️ Classical Digital Image Processing (DIP) Laboratory
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Interactive reference-based template subtraction pipeline demonstrating Gaussian convolution, Otsu binarization, mathematical morphology, and connected-component analysis.
        </p>
      </div>

      {/* Control Panel: Pairs & Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sample Selection */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" /> Reference & Test Pair
          </h2>

          <div className="space-y-2">
            <span className="text-xs text-slate-400">Select Aligned DeepPCB Image Pair:</span>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSample(s)}
                  className={`text-xs px-2.5 py-2 rounded-lg border text-left truncate transition ${
                    selectedSample.id === s.id
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-medium"
                      : "bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Note: Classical template differencing strictly requires an identical, sub-pixel aligned defect-free golden template.
          </p>
        </div>

        {/* Mathematical Parameters */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" /> Mathematical Filters
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Thresholding:</label>
              <select
                value={thresholdMethod}
                onChange={(e) => setThresholdMethod(e.target.value as "otsu" | "fixed")}
                className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-emerald-500"
              >
                <option value="otsu">Otsu Optimal</option>
                <option value="fixed">Fixed Cutoff</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Gaussian Blur:</label>
              <select
                value={gaussianKernel}
                onChange={(e) => setGaussianKernel(Number(e.target.value) as 3 | 5)}
                className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-emerald-500"
              >
                <option value={3}>3 × 3 Kernel</option>
                <option value={5}>5 × 5 Kernel</option>
              </select>
            </div>
          </div>

          {thresholdMethod === "fixed" && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Fixed Cutoff:</span>
                <span className="text-emerald-400 font-mono">{fixedCutoff}</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={fixedCutoff}
                onChange={(e) => setFixedCutoff(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          )}

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Min Defect Area:</span>
              <span className="text-emerald-400 font-mono">{minDefectArea} px</span>
            </div>
            <input
              type="range"
              min="2"
              max="100"
              value={minDefectArea}
              onChange={(e) => setMinDefectArea(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* Execution Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">
              DIP Transformation
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Transforms input pixels through grayscale conversion, Gaussian convolution, absolute subtraction, binarization, morphological opening/closing, and connected-component flood fill.
            </p>
          </div>

          <button
            onClick={runClassicalPipeline}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing Filters...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Execute DIP Pipeline</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Raw Inputs Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <span className="text-xs font-mono text-slate-400 block mb-2">
            1. Defect-Free Reference Template (Golden CAD / Scan)
          </span>
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={refImgUrl} alt="Reference PCB" className="max-h-[300px] rounded shadow-inner" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <span className="text-xs font-mono text-slate-400 block mb-2">
            2. Inspected PCB Board (With Potential Defects)
          </span>
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={testImgUrl} alt="Test PCB" className="max-h-[300px] rounded shadow-inner" />
          </div>
        </div>
      </div>

      {/* 4-Stage Multi-Stage Pipeline Breakdown */}
      {dipResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                🔬 Multi-Stage Digital Image Processing Pipeline Results
              </h2>
              <p className="text-xs text-slate-400">
                Visual demonstration of mathematical filter stages executed in browser memory.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-400">
                Latency: <strong className="text-emerald-400">{dipResult.processingTimeMs.toFixed(1)} ms</strong>
              </span>
              <span className="text-slate-400">
                Candidates: <strong className="text-yellow-400">{dipResult.candidateBoxes.length} regions</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stage 1: Absolute Diff */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-center space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">
                Stage 1: Absolute Difference
              </span>
              <p className="text-[10px] text-slate-500">|Reference - Test| (Grayscale)</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dipResult.diffCanvasUrl} alt="Diff Map" className="w-full rounded border border-slate-800" />
            </div>

            {/* Stage 2: Binarization */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-center space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">
                Stage 2: {thresholdMethod === "otsu" ? "Otsu" : "Fixed"} Binarization
              </span>
              <p className="text-[10px] text-slate-500">Raw Binary Change Mask</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dipResult.thresholdCanvasUrl} alt="Threshold Mask" className="w-full rounded border border-slate-800" />
            </div>

            {/* Stage 3: Morphology */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-center space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">
                Stage 3: Morphological Cleanup
              </span>
              <p className="text-[10px] text-slate-500">Opening (Noise) + Closing (Voids)</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dipResult.cleanedCanvasUrl} alt="Cleaned Mask" className="w-full rounded border border-slate-800" />
            </div>

            {/* Stage 4: Overlays */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-center space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">
                Stage 4: Connected Components
              </span>
              <p className="text-[10px] text-slate-500">Localized Candidate Overlays</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dipResult.annotatedCanvasUrl} alt="Annotated Overlays" className="w-full rounded border border-slate-800" />
            </div>
          </div>

          {/* Academic Insight Warning */}
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4" />
              <span>Scientific Limitation of Classical Differencing</span>
            </div>
            <p className="text-amber-300/80 leading-relaxed">
              Classical template differencing successfully localizes pixel changes, but **cannot categorize defect semantics** (it cannot distinguish an open circuit from a short circuit or pin-hole). Furthermore, mechanical vibration or sub-pixel shifts cause severe false alarms along copper trace edges.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
