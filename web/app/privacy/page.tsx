import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, ServerOff, Database, Eye } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — PCB Vision AI",
  description:
    "Privacy Policy for PCB Vision AI: Learn how our 100% client-side WebAssembly inference protects your intellectual property with zero server-side image transmission.",
};

export default function PrivacyPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider font-mono">
            <ShieldCheck className="w-4 h-4" /> Client-Side Privacy Guarantee
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Privacy Policy & Data Security
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            PCB Vision AI is built with an absolute privacy-by-design architecture. Uploaded circuit board imagery never leaves your physical device.
          </p>
        </div>

        {/* 3 Privacy Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <ServerOff className="w-6 h-6 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Zero Server Uploads</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inference is executed exclusively inside client-side WebAssembly memory (WASM SIMD). No image bytes are transmitted over the internet to any cloud server or database.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <Lock className="w-6 h-6 text-teal-400" />
            <h2 className="text-base font-bold text-white">IP & Gerber Protection</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Proprietary printed circuit board CAD designs, fabrication gerbers, and defect imagery remain strictly confidential within your local browser sandbox session.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <Database className="w-6 h-6 text-cyan-400" />
            <h2 className="text-base font-bold text-white">No Tracking Cookies</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              We do not deploy marketing cookies, fingerprinting pixels, or commercial tracking beacons. The application is completely functional without personal data harvesting.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-lg font-bold text-white">1. Information We Do Not Collect</h3>
            <p>
              When you upload or drag-and-drop a PCB image into the AI Inspector or Classical DIP Laboratory, the image is loaded into an HTML5 Canvas element via a local <code className="text-emerald-400 font-mono text-xs">blob:</code> URL. At no point is the image transferred to Vercel, external cloud APIs, or third-party storage buckets. When you refresh or close your browser tab, all image buffers in volatile RAM are purged.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-bold text-white">2. Model Asset Loading</h3>
            <p>
              The trained neural network weights (<code className="text-emerald-400 font-mono text-xs">pcb_yolov8n.onnx</code>, ~12.2 MB) and ONNX Runtime Web runtime binaries are downloaded from the edge CDN to your browser cache once. Once cached, model execution occurs entirely offline inside your browser thread or WebWorker.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-bold text-white">3. Local Storage Usage</h3>
            <p>
              The application may store non-sensitive user preferences (e.g. selected confidence threshold or active inspection tab) in your browser&apos;s local storage. No personally identifiable information (PII) is ever retained.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-bold text-white">4. Open Source Transparency</h3>
            <p>
              The complete client-side inference pipeline and UI source code are open-source and auditable on GitHub at{" "}
              <a
                href="https://github.com/skmdshariff143-ai/PCB-Vision-AI"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 underline hover:text-emerald-300"
              >
                github.com/skmdshariff143-ai/PCB-Vision-AI
              </a>.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-bold text-white">5. Contact & Academic Inquiries</h3>
            <p>
              For academic research inquiries, code audits, or questions regarding this capstone project, please open an issue on the GitHub repository or contact the project author via the repository profile.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>PCB Vision AI © 2026 • Privacy-Preserving Industrial Inspection</div>
          <div className="flex gap-4 text-slate-400">
            <Link href="/" className="hover:text-emerald-400">Home</Link>
            <Link href="/terms" className="hover:text-emerald-400">Terms of Use</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
