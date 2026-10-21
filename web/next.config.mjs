import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Force onnxruntime-web to resolve to browser-only UMD build
    config.resolve.alias = {
      ...config.resolve.alias,
      "onnxruntime-web$": path.resolve(__dirname, "node_modules/onnxruntime-web/dist/ort.all.min.js"),
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },
};

export default nextConfig;
