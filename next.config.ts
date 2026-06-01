import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: "20mb",
  },
  // Turbopack + Vercel middleware .nft.json 생성 버그 회피를 위해 비활성화
  // Next.js 16 + Turbopack 조합에서 middleware.js.nft.json 누락 오류 발생
  // 참고: https://github.com/vercel/next.js/issues/71778
};

export default nextConfig;
