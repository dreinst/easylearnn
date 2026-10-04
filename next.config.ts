import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone untuk image Docker di VPS; Vercel memakai keluaran bawaannya sendiri
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
};

export default nextConfig;
