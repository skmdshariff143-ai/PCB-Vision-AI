"use client";

import React from "react";
import { Info, HelpCircle, ShieldAlert, Award, FileCode } from "lucide-react";

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
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          ℹ️ Project Information & Academic Defense
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Final-year Electronics & Communication Engineering (ECE) capstone project overview, technical defense guide, and dataset attribution.
        </p>
      </div>

      {/* Project Meta Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Award className="w-4 h-4" /> Academic Domain
          </div>
          <h3 className="text-white font-bold text-base">Electronics & Communication</h3>
          <p className="text-xs text-slate-400">
            Specialization in Computer Vision, Digital Image Processing (DIP), and Edge Deep Learning for Industrial Quality Control.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <FileCode className="w-4 h-4" /> Software Architecture
          </div>
          <h3 className="text-white font-bold text-base">Next.js 14 + ONNX Runtime Web</h3>
          <p className="text-xs text-slate-400">
            Client-side WebAssembly inference with zero server dependency, complete data privacy, and Vercel edge delivery.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" /> Research Disclaimer
          </div>
          <h3 className="text-white font-bold text-base">Optical Defect Localization</h3>
          <p className="text-xs text-slate-400">
            Prototype system designed for surface optical inspection. Does not replace in-circuit electrical bed-of-nails continuity testing.
          </p>
        </div>
      </div>

      {/* Viva Voce Technical Defense Q&A */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-400" /> Viva Voce Examination Defense Guide
        </h2>
        <p className="text-xs text-slate-400">
          Core theoretical and experimental questions with technically accurate engineering justifications.
        </p>

        <div className="space-y-3">
          {vivaQuestions.map((item, idx) => (
            <div key={idx} className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-1.5">
              <h4 className="text-xs font-bold text-emerald-400 font-mono">{item.q}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset Attribution & Licensing */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 text-xs text-slate-400">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
          Dataset Attribution & Citation
        </h2>
        <p className="leading-relaxed">
          The dataset used in this research is the <strong>DeepPCB</strong> benchmark created by Tang et al. and published in:
        </p>
        <div className="p-3 bg-slate-950 rounded border border-slate-800 font-mono text-slate-300 text-[11px]">
          Tang, S., He, F., Huang, X., & Yang, J. (2019). &quot;On-line PCB Defect Detector On A New PCB Defect Dataset.&quot; <em>IEEE International Conference on Intelligent Transportation Systems (ITSC)</em>.
        </div>
        <p className="text-[11px] text-slate-500">
          The dataset is maintained for academic and non-commercial research purposes. This project independently reproduces, evaluates, and extends the benchmark with cross-paradigm DIP comparisons and browser-based WASM inference.
        </p>
      </div>
    </div>
  );
};
