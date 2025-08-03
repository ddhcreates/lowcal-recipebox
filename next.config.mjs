/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/ads.txt',
        destination: 'https://srv.adstxtmanager.com/77226/lowcalrecipebox.com',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;