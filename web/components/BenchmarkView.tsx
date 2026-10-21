"use client";

import React from "react";
import { BarChart3, CheckCircle2, Zap } from "lucide-react";

export const BenchmarkView: React.FC = () => {
  const perClassData = [
    { classId: 0, name: "Open Circuit", instances: 222, precision: 63.18, recall: 93.54, map50: 80.97, map50_95: 60.67 },
    { classId: 1, name: "Short Circuit", instances: 150, precision: 98.44, recall: 86.00, map50: 96.88, map50_95: 66.78 },
    { classId: 2, name: "Mouse Bite", instances: 184, precision: 94.45, recall: 95.11, map50: 97.60, map50_95: 77.11 },
    { classId: 3, name: "Spur", instances: 158, precision: 98.68, recall: 94.75, map50: 99.39, map50_95: 76.74 },
    { classId: 4, name: "Spurious Copper", instances: 146, precision: 100.0, recall: 99.70, map50: 99.50, map50_95: 88.38 },
    { classId: 5, name: "Pin Hole", instances: 172, precision: 100.0, recall: 97.80, map50: 99.50, map50_95: 87.37 },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          📊 Verified Model Benchmarks & Comparative Analytics
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Empirical held-out test split evaluation (177 images, 1,032 ground-truth defects) and cross-architecture comparison.
        </p>
      </div>

      {/* Top 4 KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Mean Precision</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">92.46%</div>
          <span className="text-[11px] text-slate-500 mt-1 block">IoU threshold ≥ 0.50</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Mean Recall</span>
          <div className="text-3xl font-extrabold text-teal-400 font-mono mt-1">94.48%</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Defect coverage on test split</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">mAP @ 0.50</span>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono mt-1">95.64%</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Mean Average Precision</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">mAP @ 0.50:0.95</span>
          <div className="text-3xl font-extrabold text-indigo-400 font-mono mt-1">76.18%</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Strict COCO-style metric</span>
        </div>
      </div>

      {/* Per-Class Decomposition Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" /> Per-Class Empirical Performance Breakdown
          </h2>
          <span className="text-xs font-mono text-slate-400">177 Test Images • 1,032 Defect Instances</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                <th className="py-3 px-3">Class ID</th>
                <th className="py-3 px-3">Defect Category</th>
                <th className="py-3 px-3">Test Instances</th>
                <th className="py-3 px-3">Precision</th>
                <th className="py-3 px-3">Recall</th>
                <th className="py-3 px-3">mAP@50</th>
                <th className="py-3 px-3">mAP@50-95</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {perClassData.map((row) => (
                <tr key={row.classId} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 font-bold text-slate-500">{row.classId}</td>
                  <td className="py-2.5 px-3 font-semibold text-white">{row.name}</td>
                  <td className="py-2.5 px-3 text-slate-400">{row.instances}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-400">{row.precision.toFixed(2)}%</td>
                  <td className="py-2.5 px-3 font-bold text-teal-400">{row.recall.toFixed(2)}%</td>
                  <td className="py-2.5 px-3 font-bold text-cyan-400">{row.map50.toFixed(2)}%</td>
                  <td className="py-2.5 px-3 font-bold text-indigo-400">{row.map50_95.toFixed(2)}%</td>
                </tr>
              ))}
              <tr className="bg-slate-950/80 font-bold border-t-2 border-slate-700 text-white">
                <td className="py-3 px-3 text-emerald-400">—</td>
                <td className="py-3 px-3 text-emerald-400">OVERALL AGGREGATE</td>
                <td className="py-3 px-3 text-slate-300">1,032</td>
                <td className="py-3 px-3 text-emerald-400">92.46%</td>
                <td className="py-3 px-3 text-teal-400">94.48%</td>
                <td className="py-3 px-3 text-cyan-400">95.64%</td>
                <td className="py-3 px-3 text-indigo-400">76.18%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cross-Paradigm Comparison: Deep Learning vs Classical DIP */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" /> Architectural Comparison: Deep Learning vs. Classical DIP
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                <th className="py-3 px-3">Evaluation Dimension</th>
                <th className="py-3 px-3 text-emerald-400 font-semibold">Deep Learning (YOLOv8)</th>
                <th className="py-3 px-3 text-amber-400 font-semibold">Classical DIP (Template Differencing)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 font-semibold text-white">Reference Template Requirement</td>
                <td className="py-2.5 px-3 text-emerald-400">❌ Not Required (Single inspected image)</td>
                <td className="py-2.5 px-3 text-amber-400">✅ Strictly Required (Identical golden CAD/scan)</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 font-semibold text-white">Semantic Defect Classification</td>
                <td className="py-2.5 px-3 text-emerald-400">✅ 6 Classes (Open, Short, Mousebite, Spur, Copper, Pin-hole)</td>
                <td className="py-2.5 px-3 text-red-400">❌ None (Outputs binary difference blobs only)</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 font-semibold text-white">Tolerance to Sub-Pixel Misalignment</td>
                <td className="py-2.5 px-3 text-emerald-400">✅ High (Spatial convolutional invariance)</td>
                <td className="py-2.5 px-3 text-red-400">❌ Zero (0.5 px shift produces edge difference artifacts)</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 font-semibold text-white">Tolerance to Lighting Gradients</td>
                <td className="py-2.5 px-3 text-emerald-400">✅ High (Trained on HSV color augmentations)</td>
                <td className="py-2.5 px-3 text-amber-400">❌ Low (Direct intensity subtraction shifts threshold)</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 font-semibold text-white">Inference Speed (WASM CPU)</td>
                <td className="py-2.5 px-3 font-mono text-emerald-400">~60 – 90 ms per image</td>
                <td className="py-2.5 px-3 font-mono text-amber-400">~15 – 35 ms per image pair</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 font-semibold text-white">Centroid Localization Recall</td>
                <td className="py-2.5 px-3 font-mono text-emerald-400">94.48% (Held-out test set)</td>
                <td className="py-2.5 px-3 font-mono text-amber-400">93.88% (Aligned sample pairs)</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-2.5 px-3 font-semibold text-white">False Positive Rate</td>
                <td className="py-2.5 px-3 text-emerald-400">Low (Regulated by confidence score and NMS)</td>
                <td className="py-2.5 px-3 text-red-400">High (&gt;1,800 edge noise blobs on unaligned views)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ONNX Conversion Parity Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> ONNX Runtime Parity Verification
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 block">Detection Parity</span>
            <span className="text-emerald-400 font-bold text-sm">100.0%</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 block">Mean BBox IoU</span>
            <span className="text-cyan-400 font-bold text-sm">0.999999</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 block">Model Size</span>
            <span className="text-white font-bold text-sm">12.2 MB</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 block">ONNX Opset</span>
            <span className="text-indigo-400 font-bold text-sm">Opset 18</span>
          </div>
        </div>
      </div>
    </div>
  );
};
