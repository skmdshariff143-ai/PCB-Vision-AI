"use client";

import React from "react";
import { BookOpen, AlertOctagon, Layers, Cpu, Compass } from "lucide-react";
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
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          📖 PCB Defect Taxonomy & Academic Methodology
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Detailed technical reference on industrial PCB defect classifications, manufacturing causes, and mathematical formulations.
        </p>
      </div>

      {/* Six Defect Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {defectTaxonomy.map((item) => {
          const color = DEFECT_COLORS[item.code] || "#ef4444";
          return (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 relative overflow-hidden flex flex-col justify-between"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: color }}
              />

              <div className="space-y-2">
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

                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  {item.name}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2 text-[11px]">
                <div>
                  <span className="text-slate-400 font-semibold block">Manufacturing Cause:</span>
                  <span className="text-slate-300">{item.cause}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Electrical Consequence:</span>
                  <span className="text-slate-300">{item.consequence}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DeepPCB Dataset Protocol */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" /> DeepPCB Benchmark & Zero-Leakage Group Partitioning
        </h2>

        <p className="text-xs text-slate-300 leading-relaxed">
          The <strong>DeepPCB</strong> dataset consists of 1,500 aligned optical image pairs (defect-free template and defective test image) digitized via a linear CCD scan sensor at ~48 pixels per millimeter resolution (640 × 640 crops). To prevent artificial data leakage where adjacent sub-crops of the same PCB board appear in both training and test sets, the dataset was partitioned strictly by PCB board group:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <span className="text-emerald-400 font-bold block text-sm">TRAINING SET</span>
            <span className="text-white text-xl font-extrabold mt-1 block">1,070 Images</span>
            <span className="text-slate-400 mt-1 block">7 Distinct Board Groups</span>
            <span className="text-slate-500 text-[10px] block mt-1">7,504 Bounding Boxes</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <span className="text-teal-400 font-bold block text-sm">VALIDATION SET</span>
            <span className="text-white text-xl font-extrabold mt-1 block">253 Images</span>
            <span className="text-slate-400 mt-1 block">2 Distinct Board Groups</span>
            <span className="text-slate-500 text-[10px] block mt-1">1,477 Bounding Boxes</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <span className="text-cyan-400 font-bold block text-sm">HELD-OUT TEST SET</span>
            <span className="text-white text-xl font-extrabold mt-1 block">177 Images</span>
            <span className="text-slate-400 mt-1 block">2 Distinct Board Groups</span>
            <span className="text-slate-500 text-[10px] block mt-1">1,032 Bounding Boxes</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 italic">
          Verification: Train ∩ Val = ∅, Train ∩ Test = ∅, Val ∩ Test = ∅. Zero spatial background correlation across partitions.
        </p>
      </div>

      {/* Mathematical Formulations */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" /> Core Mathematical Formulations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Formulation 1: Otsu */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <span className="font-semibold text-emerald-400 block">1. Otsu Maximum Between-Class Variance</span>
            <p className="text-slate-400 text-[11px]">
              Maximizes class separability between defect foreground and substrate background:
            </p>
            <div className="p-2 bg-slate-900 rounded font-mono text-center text-slate-200">
              σ_B²(t) = ω₀(t) · ω₁(t) · [μ₀(t) - μ₁(t)]²
            </div>
            <p className="text-slate-500 text-[10px]">
              Where ω₀, ω₁ are class probabilities, and μ₀, μ₁ are cumulative class intensity means.
            </p>
          </div>

          {/* Formulation 2: Morphology */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <span className="font-semibold text-teal-400 block">2. Mathematical Morphology (Opening & Closing)</span>
            <p className="text-slate-400 text-[11px]">
              Opening eliminates sensor noise; Closing consolidates internal voids:
            </p>
            <div className="p-2 bg-slate-900 rounded font-mono text-center text-slate-200">
              B_open = (B ⊖ S) ⊕ S, &nbsp; B_clean = (B_open ⊕ S) ⊖ S
            </div>
            <p className="text-slate-500 text-[10px]">
              Where S is a 3×3 square structuring element, ⊖ represents erosion, and ⊕ represents dilation.
            </p>
          </div>

          {/* Formulation 3: CIoU */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <span className="font-semibold text-cyan-400 block">3. Complete Intersection over Union (CIoU) Loss</span>
            <p className="text-slate-400 text-[11px]">
              Accounts for bounding box overlap, center point normalized distance, and aspect ratio:
            </p>
            <div className="p-2 bg-slate-900 rounded font-mono text-center text-slate-200">
              L_CIoU = 1 - IoU + [ρ²(b, b_gt) / c²] + α·v
            </div>
            <p className="text-slate-500 text-[10px]">
              Where c is the diagonal of the smallest enclosing box, and v measures aspect ratio consistency.
            </p>
          </div>

          {/* Formulation 4: Multi-Task */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <span className="font-semibold text-indigo-400 block">4. YOLO Multi-Task Objective Function</span>
            <p className="text-slate-400 text-[11px]">
              Jointly optimizes classification, box regression, and distribution focal loss:
            </p>
            <div className="p-2 bg-slate-900 rounded font-mono text-center text-slate-200">
              L_total = λ_cls · L_cls + λ_box · L_box + λ_dfl · L_dfl
            </div>
            <p className="text-slate-500 text-[10px]">
              L_cls uses Varifocal/BCE loss; L_dfl handles continuous box boundary regressions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
