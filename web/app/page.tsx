"use client";

import React, { useState } from "react";
import { Navbar, ActiveTab } from "@/components/Navbar";
import { InspectorView } from "@/components/InspectorView";
import { DIPLabView } from "@/components/DIPLabView";
import { BenchmarkView } from "@/components/BenchmarkView";
import { ResearchView } from "@/components/ResearchView";
import { AboutView } from "@/components/AboutView";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("inspector");

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "inspector" && <InspectorView />}
        {activeTab === "diplab" && <DIPLabView />}
        {activeTab === "benchmarks" && <BenchmarkView />}
        {activeTab === "research" && <ResearchView />}
        {activeTab === "about" && <AboutView />}
      </main>

      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            PCB Vision AI © 2026 • Intelligent Automated Optical Inspection System
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Next.js 14</span>
            <span>•</span>
            <span>ONNX Runtime Web (WASM)</span>
            <span>•</span>
            <span>DeepPCB Benchmark</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
