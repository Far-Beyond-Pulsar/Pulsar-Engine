const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Change this to be relative to the config file
  distDir: 'out',  // Changed from '../out' to 'out'
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  transpilePackages: ['monaco-editor'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'monaco-editor': path.join(__dirname, 'node_modules/monaco-editor/esm/vs/editor/editor.api.js')
      };
      
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false
      };
    }

    // Rest of your webpack config...
    const rules = config.module.rules
      .find((rule) => typeof rule.oneOf === 'object')
      .oneOf.filter((rule) => Array.isArray(rule.use));

    rules.forEach((rule) => {
      rule.use.forEach((moduleLoader) => {
        if (
          moduleLoader.loader !== undefined &&
          moduleLoader.loader.includes('css-loader') &&
          typeof moduleLoader.options.modules === 'object'
        ) {
          moduleLoader.options.modules.mode = 'global';
        }
      });
    });

    config.module.rules.push({
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [
                'tailwindcss',
                'autoprefixer',
              ],
            },
          },
        },
      ],
    });
    
    return config;
  },
  output: "export"
};

module.exports = nextConfig;