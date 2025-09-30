import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   webpack: (config) => {
    // Alias node-domexception to false so Webpack ignores it
    config.resolve.alias['node-domexception'] = false;
    return config;
  },
};

export default nextConfig;
