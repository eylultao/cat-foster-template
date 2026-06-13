import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default Server Action body limit is 1MB — too small for cat photos.
      // Raise it so staff can upload typical phone images.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
