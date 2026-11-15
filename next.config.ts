import type { NextConfig } from "next";

// The site is a static export so it can be hosted on GitHub Pages.
// On GitHub Pages it lives under /frameora, so the build sets NEXT_PUBLIC_BASE_PATH=/frameora
// (see .github/workflows/deploy.yml). Locally it's empty and the site runs at the root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true, // /shop → /shop/index.html, which GitHub Pages serves directly
  images: { unoptimized: true },
};

export default nextConfig;
