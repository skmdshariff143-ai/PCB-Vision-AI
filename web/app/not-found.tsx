import React from "react";
import Link from "next/link";
import { Cpu, ArrowLeft, Home, Eye, BarChart3 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
          <Cpu className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
            Error 404 • Trace Disconnected
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            The requested circuit route does not exist or has been relocated within the PCB Vision AI architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-medium">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 p-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link
            href="/?tab=inspector"
            className="flex items-center justify-center gap-2 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <Eye className="w-4 h-4" />
            <span>AI Inspector</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 font-mono">
          PCB Vision AI • Intelligent Automated Optical Inspection
        </div>
      </div>
    </div>
  );
}
