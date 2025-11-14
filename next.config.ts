import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bvzdctywuetxecbqrcuv.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "rseddfezbutsqgaberea.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/admin/(dashboard)",
        destination: "/admin/home",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
