/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    domains: ['images.unsplash.com', 'fakestoreapi.com', 'via.placeholder.com', 'www.medora.com.pk', 'highfy.pk'],
  },
  transpilePackages: ['geist']
};

module.exports = nextConfig;
