import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Strapi's default upload provider can't resize on the fly, its baked-in
    // format variants aren't a reliable set, and the Cloudflare/OpenNext target
    // has no image optimizer — so serve originals as-is. This also removes the
    // "loader does not implement width" warning from the old passthrough loader.
    unoptimized: true,
  },
};

export default nextConfig;
