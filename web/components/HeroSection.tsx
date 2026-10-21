"use client";

import React, { useState } from "react";
import { Cpu, Eye, ShieldCheck, Zap, ArrowRight, ChevronDown, ChevronUp, Github, FileText, CheckCircle2, Layers } from "lucide-react";
import { ActiveTab } from "@/components/Navbar";

interface HeroSectionProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mb-6 transition-all duration-300">
      {/* Top Banner & Title Area */}
      <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-850 to-slate-900 border-b border-slate-800/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Edge AI • ONNX Runtime WebAssembly</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Intelligent Bare PCB Defect Inspection &amp; Classification
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              A dual-paradigm Automated Optical Inspection (AOI) platform combining <strong className="text-white">Classical Digital Image Processing (DIP)</strong> difference analysis with <strong className="text-white">YOLOv8 Deep Learning</strong>. Executes 100% locally inside your browser with complete intellectual property privacy.
            </p>
          </div>

          {/* Quick Action CTA Pill Buttons */}
          <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate("inspector")}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Eye className="w-4 h-4" />
              <span>Launch AI Inspector</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onNavigate("diplab")}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Explore Classical DIP Lab</span>
            </button>
          </div>
        </div>

        {/* 4 Verified Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] uppercase font-mono text-slate-400 tracking-wider">mAP @ 0.50</span>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">95.64%</div>
            <span className="text-[10px] text-slate-500 block mt-0.5">DeepPCB Held-Out Test</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] uppercase font-mono text-slate-400 tracking-wider">Mean Recall</span>
            <div className="text-2xl font-extrabold text-teal-400 font-mono mt-0.5">94.48%</div>
            <span className="text-[10px] text-slate-500 block mt-0.5">1,032 Test Instances</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] uppercase font-mono text-slate-400 tracking-wider">Mean Precision</span>
            <div className="text-2xl font-extrabold text-cyan-400 font-mono mt-0.5">92.46%</div>
            <span className="text-[10px] text-slate-500 block mt-0.5">IoU &ge; 0.50 Threshold</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] uppercase font-mono text-slate-400 tracking-wider">In-Browser Privacy</span>
            <div className="text-2xl font-extrabold text-indigo-400 font-mono mt-0.5">100%</div>
            <span className="text-[10px] text-slate-500 block mt-0.5">Zero Cloud Uploads</span>
          </div>
        </div>
      </div>

      {/* Expandable Technical Context Drawer */}
      <div className="bg-slate-950/40 px-6 sm:px-8 py-3 flex items-center justify-between text-xs text-slate-400">
        <span className="font-mono">
          Domain Specification: Bare (Unpopulated) Circuit Boards • 6 Surface Defect Classes
        </span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-slate-300 hover:text-white transition font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 rounded px-2 py-1"
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? "Collapse Details" : "Expand Technical Specs"}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-6 sm:p-8 bg-slate-950/80 border-t border-slate-800/80 space-y-6 text-xs text-slate-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Six Defect Classes */}
            <div className="space-y-2.5">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider font-mono">
                <span className="w-1.5 h-3.5 bg-emerald-500 rounded-sm" /> Six Defect Categories
              </h2>
              <p className="text-slate-400 leading-relaxed">
                Trained on the DeepPCB benchmark across all six primary surface manufacturing anomalies:
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                <div className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                  <span>0: Open Circuit</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
                  <span>1: Short Circuit</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
                  <span>2: Mouse Bite</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" />
                  <span>3: Spur</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" />
                  <span>4: Spurious Cu</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                  <span>5: Pin Hole</span>
                </div>
              </div>
            </div>

            {/* Column 2: Dual-Architecture Comparison */}
            <div className="space-y-2.5">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider font-mono">
                <span className="w-1.5 h-3.5 bg-teal-500 rounded-sm" /> Dual-Paradigm Architecture
              </h2>
              <ul className="space-y-2 text-slate-400 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-200">Classical DIP:</strong> Pairwise template subtraction, Otsu thresholding, morphological noise removal, and Connected-Component Analysis.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-200">YOLOv8 Deep Learning:</strong> Single-image multi-class object detection. Invariant to conveyor vibration, trace routing variations, and minor lighting shifts.
                  </span>
                </li>
              </ul>
            </div>

            {/* Column 3: Operational Scope & Limitations */}
            <div className="space-y-2.5">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider font-mono">
                <span className="w-1.5 h-3.5 bg-cyan-500 rounded-sm" /> Domain Boundaries &amp; Integrity
              </h2>
              <p className="text-slate-400 leading-relaxed">
                Engineered for <strong className="text-slate-200">bare etched PCBs</strong> (unpopulated green/copper substrates). It does not inspect soldered surface-mount integrated circuits, BGA packages, or through-hole components.
              </p>
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed">
                Optical AOI screens surface geometry and does not substitute for in-circuit bed-of-nails continuity testing.
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
