import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://pcb-vision-ai-ten.vercel.app";

export const viewport: Viewport = {
  themeColor: "#090d16",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PCB Vision AI — Intelligent Bare PCB Defect Inspection & Classification",
    template: "%s | PCB Vision AI",
  },
  description:
    "Production-grade Automated Optical Inspection (AOI) combining YOLOv8 Deep Learning (ONNX Runtime Web WASM) and Classical Digital Image Processing (DIP) for bare Printed Circuit Boards. 100% private, client-side inference.",
  applicationName: "PCB Vision AI",
  authors: [{ name: "Shaik Mahammad Shariff", url: "https://github.com/skmdshariff143-ai" }],
  generator: "Next.js 14",
  keywords: [
    "PCB defect detection",
    "Printed Circuit Board Inspection",
    "Computer Vision",
    "Deep Learning",
    "YOLOv8",
    "ONNX Runtime Web",
    "WebAssembly SIMD",
    "Automated Optical Inspection",
    "Digital Image Processing",
    "DeepPCB Benchmark",
    "ECE Capstone Project",
  ],
  creator: "Shaik Mahammad Shariff",
  publisher: "PCB Vision AI Engineering",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "PCB Vision AI",
    title: "PCB Vision AI — Intelligent Bare PCB Defect Inspection & Classical DIP",
    description:
      "Automated Optical Inspection combining YOLOv8 ONNX Web and Classical DIP difference analysis on the DeepPCB benchmark. 95.64% mAP@50 with 100% client-side privacy.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PCB Vision AI — Intelligent Bare PCB Defect Inspection",
    description:
      "Client-side YOLOv8 ONNX Web & Classical DIP inspection system for bare circuit boards. Real-time inference with zero cloud server uploads.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "PCB Vision AI",
        "operatingSystem": "Web Browser (Chrome, Firefox, Safari, Edge)",
        "applicationCategory": "DeveloperApplication, EngineeringApplication",
        "description":
          "Intelligent Automated Optical Inspection system for bare Printed Circuit Boards using YOLOv8 ONNX Runtime Web and Classical Digital Image Processing.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
        "author": {
          "@type": "Person",
          "name": "Shaik Mahammad Shariff",
          "url": "https://github.com/skmdshariff143-ai",
        },
        "url": siteUrl,
      },
      {
        "@type": "WebSite",
        "name": "PCB Vision AI",
        "url": siteUrl,
        "description":
          "Intelligent Bare PCB Defect Detection and Classification combining Classical DIP and Deep Learning.",
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}
