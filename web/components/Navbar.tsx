"use client";

import React from "react";
import Link from "next/link";
import { Cpu, Eye, BarChart3, BookOpen, Info, Github, ShieldCheck } from "lucide-react";

export type ActiveTab = "inspector" | "diplab" | "benchmarks" | "research" | "about";

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode }> = [
    { id: "inspector", label: "AI Inspector", icon: <Eye className="w-4 h-4" /> },
    { id: "diplab", label: "Classical DIP Lab", icon: <Cpu className="w-4 h-4" /> },
    { id: "benchmarks", label: "Model Benchmarks", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "research", label: "Defect Taxonomy", icon: <BookOpen className="w-4 h-4" /> },
    { id: "about", label: "Academic Info", icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <button
            onClick={() => setActiveTab("inspector")}
            className="flex items-center space-x-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1"
            aria-label="PCB Vision AI Homepage"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-lg shadow-sm">
              PCB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  PCB Vision AI
                </span>
                <span className="hidden sm:inline-block text-[11px] text-slate-400 font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                  v2.0 • ONNX WASM
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden md:block">
                Bare PCB Defect Detection &amp; Classical DIP
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-1" aria-label="Primary Navigation">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Header Action Badges & GitHub Link */}
          <div className="flex items-center space-x-3">
            <Link
              href="/privacy"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition"
              title="100% Client-Side Privacy Policy"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Client-Side</span>
            </Link>

            <a
              href="https://github.com/skmdshariff143-ai/PCB-Vision-AI"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label="View source code on GitHub"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>

        {/* Mobile Navigation Row (WCAG AA Compliant 44px min touch target) */}
        <div className="flex md:hidden space-x-1 py-2 overflow-x-auto border-t border-slate-800/80 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-2.5 min-h-[44px] rounded-lg text-xs font-medium whitespace-nowrap transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-slate-400 hover:bg-slate-800"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
