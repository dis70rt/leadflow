import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";
import path from "node:path";

loadEnvConfig(path.resolve(process.cwd(), ".."));

const config: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1"],
};
export default config;
