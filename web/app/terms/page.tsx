import React from "react";
import Link from "next/link";
import { FileText, ArrowLeft, AlertTriangle, ShieldCheck, Scale, Cpu } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use & Academic Disclaimers — PCB Vision AI",
  description:
    "Terms of Use and research disclaimers for PCB Vision AI: Understand model scope, DeepPCB dataset domain limitations, and non-commercial academic licensing.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Application</span>
          </Link>
          <span className="font-mono text-xs text-slate-400">
            Last Updated: October 2026
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider font-mono">
            <Scale className="w-4 h-4" /> Academic Capstone Terms
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Terms of Use & Engineering Disclaimers
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Please review the following operational limitations, academic licensing terms, and safety disclaimers prior to utilizing the PCB Vision AI platform.
          </p>
        </div>

        {/* 3 Key Operational Boundaries */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <h2 className="text-base font-bold text-white">No Electrical Guarantee</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Optical inspection detects surface geometric trace discrepancies. It does NOT guarantee electrical continuity, impedance matching, or high-voltage isolation.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <Cpu className="w-6 h-6 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Bare PCB Domain Only</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              The deep learning model is trained specifically on bare (unpopulated) circuit board substrates (DeepPCB benchmark). It is not trained for assembled SMT boards.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Educational Research</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              This system is an academic research demonstration developed as an undergraduate ECE capstone engineering project under open-source terms.
            </p>
          </div>
        </div>

        {/* Detailed Terms */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-lg font-bold text-white">1. Research & Demonstration Purpose</h3>
            <p>
              PCB Vision AI is provided solely for educational, academic evaluation, and research demonstration purposes. It is engineered to demonstrate the feasibility of high-accuracy client-side object detection (YOLOv8 via ONNX Runtime Web) coupled with Classical Digital Image Processing techniques (Gaussian filtering, template subtraction, and Connected-Component Analysis).
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-bold text-white">2. Scope of Optical Automated Optical Inspection (AOI)</h3>
            <p>
              In electronic manufacturing, Automated Optical Inspection (AOI) serves as a first-line geometric screening mechanism. It does not replace comprehensive electrical testing methods such as in-circuit bed-of-nails continuity testing, flying probe testing, automated X-ray inspection (AXI) for internal multi-layer shorts, or functional boundary-scan testing.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-bold text-white">3. Zero-Defect Verdict Interpretation</h3>
            <p>
              When an uploaded image produces zero bounding box detections at the chosen confidence threshold, the application reports <em>&quot;No surface anomalies detected within the current model threshold and bare-PCB DeepPCB domain.&quot;</em> This output must never be construed as an industrial product certification, functional warranty, or electrical sign-off.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-bold text-white">4. Dataset Attribution & Intellectual Property</h3>
            <p>
              The baseline training data is derived from the DeepPCB dataset published by Tang et al. (2019). The dataset is utilized in accordance with academic non-commercial research fair use. All code developed specifically for this application is released under open-source MIT terms.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-bold text-white">5. Limitation of Liability</h3>
            <p>
              The author and hosting providers disclaim all liability for any direct, indirect, or consequential damages resulting from the use or inability to use this software, including but not limited to electronic fabrication defects, component failures, or inspection omissions.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>PCB Vision AI © 2026 • Academic Capstone Research</div>
          <div className="flex gap-4 text-slate-400">
            <Link href="/" className="hover:text-emerald-400">Home</Link>
            <Link href="/privacy" className="hover:text-emerald-400">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
