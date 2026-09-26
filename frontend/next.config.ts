import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const securityHeaders = [
  // Force HTTPS for two years (the API already sends this)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // Stop browsers guessing a file's type (blocks MIME-sniffing attacks)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Nobody else may embed the site in a frame (clickjacking)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The site needs none of these browser features
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      // Local dev — Laravel storage
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
      // Cloudinary CDN
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);