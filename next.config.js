/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      type: "asset/source",
      generator: {
        filename: "assets/images/[hash][ext]",
      },
    });

    return config;
  },
};

module.exports = nextConfig;
