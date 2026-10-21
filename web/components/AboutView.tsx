"use client";

import React from "react";
import Link from "next/link";
import { Info, HelpCircle, ShieldAlert, Award, FileCode, ExternalLink, Github } from "lucide-react";

export const AboutView: React.FC = () => {
  const vivaQuestions = [
    {
      q: "Q1: What are the primary failure mechanisms of the six PCB defects in electronic circuits?",
      a: "Open circuits cause complete signal/power failure. Short circuits cause component destruction and current overload. Mouse bites cause localized resistance increases (I²R heating) and high-frequency impedance mismatch. Spurs cause electric field concentration and dielectric breakdown. Spurious copper risks detachment and delayed bridging. Pin-holes weaken solder joint shear strength and solder pad current density.",
    },
    {
      q: "Q2: Why does classical template subtraction achieve high centroid recall but fail on strict IoU?",
      a: "In DeepPCB ground-truth annotations, human annotators encircle the entire circuit trace feature (e.g. 40×40 px), whereas pixel subtraction only highlights the missing or spurious copper difference mask (e.g. 10×6 px). The defect centroid falls squarely inside the ground truth (93.9% centroid recall), but the strict intersection over union is penalized by the area disparity.",
    },
    {
      q: "Q3: Why is single-image Deep Learning superior to Classical DIP in modern manufacturing?",
      a: "Classical DIP strictly requires storing, retrieving, and sub-pixel aligning a golden reference CAD/scan for every board SKU. Any conveyor vibration produces edge false alarms. Furthermore, DIP outputs binary blobs without semantic classification. YOLO performs single-image multi-class defect classification with high invariance to lighting and mechanical misalignment.",
    },
    {
      q: "Q4: Why was group-based dataset partitioning mandatory?",
      a: "The 1,500 images in DeepPCB are crops from 11 large PCB motherboards. Sub-crops from the same board share identical trace routing, copper color, and substrate texture. Random image shuffling would leak identical background patterns into both training and test sets, artificially inflating accuracy. Group-based splitting ensures strict board-level isolation.",
    },
    {
      q: "Q5: How does ONNX Runtime Web execute model inference inside the browser without Python?",
      a: "The PyTorch model was compiled to the Open Neural Network Exchange (ONNX) format with Opset 18. In the browser, ONNX Runtime Web uses WebAssembly (WASM) with SIMD multi-threading to execute convolution graphs directly in the browser's JavaScript V8/SpiderMonkey engine, processing frames in ~60-90 ms without sending data to any cloud server.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Academic Project Overview &amp; Viva Voce Defense
          </h1>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-semibold">
            Capstone Thesis
          </span>
        </div>
        <p className="text-slate-400 text-sm mt-1">
          Final-year Electronics &amp; Communication Engineering (ECE) capstone project overview, technical defense guide, and dataset attribution.
        </p>
      </div>

      {/* Project Meta Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider font-mono">
            <Award className="w-4 h-4" /> Academic Domain
          </div>
          <h2 className="text-white font-bold text-base">Electronics &amp; Communication</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Specialization in Computer Vision, Digital Image Processing (DIP), and Edge Deep Learning for Automated Optical Inspection (AOI).
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider font-mono">
            <FileCode className="w-4 h-4" /> Software Architecture
          </div>
          <h2 className="text-white font-bold text-base">Next.js 14 + ONNX Web</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Client-side WebAssembly inference with zero server dependency, complete data privacy, and Vercel edge delivery.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider font-mono">
            <ShieldAlert className="w-4 h-4" /> Research Scope
          </div>
          <h2 className="text-white font-bold text-base">Bare PCB Optical Inspection</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Designed for bare circuit board copper surfaces. Does not replace in-circuit electrical bed-of-nails continuity testing.
          </p>
        </div>
      </div>

      {/* Viva Voce Technical Defense Q&A */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-400" /> Viva Voce Examination Defense Guide
        </h2>
        <p className="text-xs text-slate-400">
          Core theoretical and experimental questions with technically accurate engineering justifications for academic evaluators.
        </p>

        <div className="space-y-3 pt-2">
          {vivaQuestions.map((item, idx) => (
            <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold text-emerald-400 font-mono">{item.q}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset Attribution & Academic Citation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 text-xs text-slate-400 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 font-mono">
          Dataset Attribution &amp; Scholarly Citation
        </h2>
        <p className="leading-relaxed">
          The benchmark dataset used in this engineering research is the <strong>DeepPCB</strong> dataset published by Tang et al. (2019). It provides 1,500 aligned bare printed circuit board image pairs with 10,013 verified defect bounding box annotations.
        </p>
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed">
          Tang, S., He, F., Huang, X., &amp; Yang, J. (2019). Online PCB defect detector on a new dataset. arXiv preprint arXiv:1902.06197.
        </div>
        <div className="flex flex-wrap gap-4 pt-2">
          <a
            href="https://github.com/tangsanli5201/DeepPCB"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-mono text-xs underline"
          >
            <span>DeepPCB GitHub Repository</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://github.com/skmdshariff143-ai/PCB-Vision-AI"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-mono text-xs underline"
          >
            <Github className="w-3.5 h-3.5" />
            <span>PCB Vision AI GitHub Repository</span>
          </a>
        </div>
      </div>
    </div>
  );
};
