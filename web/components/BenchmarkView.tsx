"use client";

import React from "react";
import { BarChart3, CheckCircle2, Zap, ShieldCheck, Layers, Award } from "lucide-react";

export const BenchmarkView: React.FC = () => {
  const perClassData = [
    { classId: 0, name: "Open Circuit", instances: 222, precision: 63.18, recall: 93.54, map50: 80.97, map50_95: 60.67, color: "#ef4444" },
    { classId: 1, name: "Short Circuit", instances: 150, precision: 98.44, recall: 86.00, map50: 96.88, map50_95: 66.78, color: "#f97316" },
    { classId: 2, name: "Mouse Bite", instances: 184, precision: 94.45, recall: 95.11, map50: 97.60, map50_95: 77.11, color: "#eab308" },
    { classId: 3, name: "Spur", instances: 158, precision: 98.68, recall: 94.75, map50: 99.39, map50_95: 76.74, color: "#a855f7" },
    { classId: 4, name: "Spurious Copper", instances: 146, precision: 100.0, recall: 99.70, map50: 99.50, map50_95: 88.38, color: "#06b6d4" },
    { classId: 5, name: "Pin Hole", instances: 172, precision: 100.0, recall: 97.80, map50: 99.50, map50_95: 87.37, color: "#22c55e" },
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Verified Model Benchmarks &amp; Comparative Analytics
          </h1>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
            Empirical Results
          </span>
        </div>
        <p className="text-slate-400 text-sm mt-1">
          Empirical evaluation on the held-out test split of the DeepPCB benchmark (177 images, 1,032 ground-truth defect annotations) using 50 epochs of GPU training on a Tesla T4.
        </p>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 font-mono">Mean Precision</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">92.46%</div>
          <span className="text-[11px] text-slate-500 mt-1 block">IoU threshold &ge; 0.50</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 font-mono">Mean Recall</span>
          <div className="text-3xl font-extrabold text-teal-400 font-mono mt-1">94.48%</div>
          <span className="text-[11px] text-slate-500 mt-1 block">1,032 Test Instances</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 font-mono">mAP @ 0.50</span>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono mt-1">95.64%</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Mean Average Precision</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 font-mono">mAP @ 0.50:0.95</span>
          <div className="text-3xl font-extrabold text-indigo-400 font-mono mt-1">76.18%</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Strict Multi-IoU Metric</span>
        </div>
      </div>

      {/* Per-Class Decomposition Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" /> Per-Class Empirical Performance Breakdown
          </h2>
          <span className="text-xs font-mono text-slate-400">177 Test Images &bull; 1,032 Defect Instances</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse" aria-label="Per-Class Empirical Benchmark Metrics">
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
                  <td className="py-2.5 px-3 font-bold text-slate-500">#{row.classId}</td>
                  <td className="py-2.5 px-3 font-semibold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                    <span>{row.name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{row.instances}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-400">{row.precision.toFixed(2)}%</td>
                  <td className="py-2.5 px-3 font-bold text-teal-400">{row.recall.toFixed(2)}%</td>
                  <td className="py-2.5 px-3 font-bold text-cyan-400">{row.map50.toFixed(2)}%</td>
                  <td className="py-2.5 px-3 font-bold text-indigo-400">{row.map50_95.toFixed(2)}%</td>
                </tr>
              ))}
              <tr className="bg-slate-950/80 font-bold border-t-2 border-slate-700 text-white">
                <td className="py-3 px-3 text-emerald-400">&mdash;</td>
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

      {/* Cross-Framework Parity & Latency Evaluation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" /> PyTorch vs. ONNX Runtime Parity
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The exported ONNX model (<code className="text-emerald-400 font-mono">pcb_yolov8n.onnx</code>, 12.2 MB, Opset 18) was benchmarked against native PyTorch CPU across the DeepPCB test split:
          </p>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400">PyTorch Test Detections:</span>
              <span className="text-white font-bold">122 / 122</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400">ONNX Runtime Detections:</span>
              <span className="text-emerald-400 font-bold">122 / 122 (100% Parity)</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400">Mean Bounding Box IoU:</span>
              <span className="text-emerald-400 font-bold">0.999999</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Inference Acceleration:</span>
              <span className="text-cyan-400 font-bold">~7.1&times; faster than PyTorch CPU</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" /> Dataset Group-Isolation Guarantee
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            To prevent data leakage, dataset partitioning strictly respects physical PCB motherboard groupings rather than random image shuffling:
          </p>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400">Training Split (Groups 1&ndash;7):</span>
              <span className="text-white">1,070 images (71.3%)</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400">Validation Split (Groups 8&ndash;9):</span>
              <span className="text-white">253 images (16.9%)</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400">Held-Out Test Split (Groups 10&ndash;11):</span>
              <span className="text-white">177 images (11.8%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Inter-Group Trace Leakage:</span>
              <span className="text-emerald-400 font-bold">0.00% Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
