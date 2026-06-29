import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["leaflet.markercluster", "leaflet.heat"],
};

export default nextConfig;
