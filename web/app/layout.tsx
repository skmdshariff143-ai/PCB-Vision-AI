import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PCB Vision AI — Intelligent Automated PCB Defect Inspection",
  description:
    "Automated Bare Printed Circuit Board Defect Detection and Classification combining Classical Digital Image Processing and Deep Learning (YOLOv8 ONNX Web).",
  keywords: [
    "PCB defect detection",
    "Computer Vision",
    "Deep Learning",
    "YOLOv8",
    "ONNX Runtime Web",
    "Automated Optical Inspection",
    "Digital Image Processing",
    "DeepPCB",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
