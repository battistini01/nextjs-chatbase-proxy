import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  /* config options here */
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
  async rewrites() {
    return [
      {
        source: "/help",
        destination: `https://chatbase.co/${process.env.NEXT_PUBLIC_CHATBASE_ID}/help`,
      },
      // This second rule is needed to correctly proxy asset requests
      // like CSS, JS, and images from your help center.
      {
        source: "/help/:path*",
        destination: `https://chatbase.co/${process.env.NEXT_PUBLIC_CHATBASE_ID}/help/:path*`,
      },
    ];
  },
};

export default nextConfig;
