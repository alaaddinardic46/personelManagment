import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Next.js'in experimental özelliklerini etkinleştirmek yerine sadece matcher'ı kullanıyoruz
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;