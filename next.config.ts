import type { NextConfig } from "next";

console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("SUPABASE PUBLISHABLE KEY:", process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
