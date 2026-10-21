"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar, ActiveTab } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { InspectorView } from "@/components/InspectorView";
import { DIPLabView } from "@/components/DIPLabView";
import { BenchmarkView } from "@/components/BenchmarkView";
import { ResearchView } from "@/components/ResearchView";
import { AboutView } from "@/components/AboutView";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("inspector");

  // Read initial tab from URL query params safely on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as ActiveTab;
      if (tabParam && ["inspector", "diplab", "benchmarks", "research", "about"].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Sync tab changes to URL without page reload
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#090d16] text-slate-100">
      <Navbar activeTab={activeTab} setActiveTab={handleTabChange} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Engineering Hero Section */}
        <HeroSection onNavigate={handleTabChange} />

        {/* Tabbed Engineering Modules */}
        <section aria-label="Selected Engineering Inspection Module">
          {activeTab === "inspector" && <InspectorView />}
          {activeTab === "diplab" && <DIPLabView />}
          {activeTab === "benchmarks" && <BenchmarkView />}
          {activeTab === "research" && <ResearchView />}
          {activeTab === "about" && <AboutView />}
        </section>
      </main>

      {/* Comprehensive Professional Engineering Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-8 text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-white font-semibold">
                PCB Vision AI • Intelligent Automated Optical Inspection
              </span>
            </div>

            <nav className="flex flex-wrap items-center gap-4 text-slate-400" aria-label="Footer Legal & Resources">
              <Link href="/privacy" className="hover:text-emerald-400 transition">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-emerald-400 transition">
                Terms of Use
              </Link>
              <span>•</span>
              <a
                href="https://github.com/skmdshariff143-ai/PCB-Vision-AI"
                target="_blank"
                rel="noreferrer"
                className="hover:text-emerald-400 transition"
              >
                GitHub Source
              </a>
              <span>•</span>
              <a
                href="https://github.com/tangsanli5201/DeepPCB"
                target="_blank"
                rel="noreferrer"
                className="hover:text-emerald-400 transition"
              >
                DeepPCB Dataset
              </a>
            </nav>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 pt-3 border-t border-slate-800/60">
            <div>
              Academic Capstone Project in Electronics &amp; Communication Engineering (ECE) • Client-Side WebAssembly (SIMD)
            </div>
            <div>
              Author: Shaik Mahammad Shariff • Open Source MIT License
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
