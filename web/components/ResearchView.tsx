"use client";

import React from "react";
import { BookOpen, AlertOctagon, Layers, Cpu, Compass, ShieldAlert } from "lucide-react";
import { DEFECT_COLORS } from "@/lib/constants";

export const ResearchView: React.FC = () => {
  const defectTaxonomy = [
    {
      id: 0,
      name: "Open Circuit",
      code: "open",
      severity: "CRITICAL",
      description: "A complete physical discontinuity or break across a conductive copper trace.",
      cause: "Over-etching, physical scratch during handling, or particulate masking during photoresist exposure.",
      consequence: "Permanent loss of electrical connectivity between IC pins, resulting in complete board operational failure.",
    },
    {
      id: 1,
      name: "Short Circuit",
      code: "short",
      severity: "CRITICAL",
      description: "An unintended conductive copper bridge spanning two or more adjacent independent traces or solder pads.",
      cause: "Under-etching, conductive debris deposition, or improper solder paste bridging during reflow.",
      consequence: "Catastrophic power-to-ground or signal-to-signal electrical short, risking permanent component destruction.",
    },
    {
      id: 2,
      name: "Mouse Bite",
      code: "mousebite",
      severity: "MODERATE",
      description: "A semi-circular or irregular indentation notched into the edge of a copper trace, narrowing its effective cross-section.",
      cause: "Local photoresist delamination, air bubble entrapment, or abrasive handling.",
      consequence: "Localized increase in trace electrical resistance, causing high-frequency impedance mismatch and localized I²R overheating.",
    },
    {
      id: 3,
      name: "Spur",
      code: "spur",
      severity: "MODERATE",
      description: "A sharp, pointed projection extending outward from the boundary of a conductive trace.",
      cause: "Imperfect photoresist mask development or microscopic scratch in photo-tool film.",
      consequence: "Creates localized high electric field gradients, leading to potential dielectric breakdown and electrostatic discharge arcing.",
    },
    {
      id: 4,
      name: "Spurious Copper",
      code: "copper",
      severity: "LOW - MODERATE",
      description: "An isolated island or residual flake of unetched copper remaining on the non-conductive dielectric substrate.",
      cause: "Uneven etchant fluid circulation or pin-hole defect in etchant spray nozzles.",
      consequence: "Risk of dislodging under mechanical vibration or thermal cycling, creating intermittent short circuits across the board.",
    },
    {
      id: 5,
      name: "Pin Hole",
      code: "pin-hole",
      severity: "MODERATE",
      description: "A microscopic void or perforation completely or partially through a copper plane, solder pad, or trace.",
      cause: "Dust contamination during photo-exposure or localized copper plating cavitation.",
      consequence: "Degrades current handling capacity and causes solder voiding, weakening component lead mechanical adhesion.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            PCB Defect Taxonomy &amp; Academic Methodology
          </h1>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-purple-500/10 border border-purple-500/30 text-purple-400 font-semibold">
            IPC Standards
          </span>
        </div>
        <p className="text-slate-400 text-sm mt-1">
          Technical specifications covering the six industrial bare-PCB defect classifications, physical manufacturing failure mechanisms, and mathematical loss functions.
        </p>
      </div>

      {/* Six Defect Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {defectTaxonomy.map((item) => {
          const color = DEFECT_COLORS[item.code] || "#ef4444";
          return (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 relative overflow-hidden flex flex-col justify-between shadow-sm hover:border-slate-700 transition"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: color }}
              />

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-400">CLASS #{item.id}</span>
                  <span
                    className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                      item.severity === "CRITICAL"
                        ? "bg-red-500/20 text-red-400 border border-red-500/40"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    }`}
                  >
                    {item.severity}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <h3 className="text-base font-bold text-white tracking-tight">{item.name}</h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider block font-mono">
                    Fabrication Cause:
                  </span>
                  <span className="text-slate-300 text-xs">{item.cause}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider block font-mono">
                    Circuit Impact:
                  </span>
                  <span className="text-slate-300 text-xs">{item.consequence}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Learning Mathematical Loss Formulation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-400" /> YOLOv8 Loss Formulation &amp; Training Strategy
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The anchor-free YOLOv8 architecture utilizes a decoupled head with task-aligned assigner optimization. Total loss is computed via three complementary objectives:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-emerald-400 font-bold">1. Complete IoU Loss (L_CIoU)</span>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Enforces overlap area, central point distance, and aspect ratio consistency between predicted and ground-truth bounding boxes.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-teal-400 font-bold">2. Distribution Focal Loss (L_DFL)</span>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Models bounding box coordinates as continuous probability distributions rather than Dirac delta functions, improving small-defect corner accuracy.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-cyan-400 font-bold">3. Binary Cross-Entropy (L_BCE)</span>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Decoupled multi-label classification loss penalizing incorrect defect assignments across the six candidate classes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
