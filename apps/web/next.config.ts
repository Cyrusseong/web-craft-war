import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@web-craft-war/shared-types', '@web-craft-war/game-logic'],
  webpack: (config) => {
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      cacheGroups: {
        ...config.optimization.splitChunks?.cacheGroups,
        pixijs: {
          test: /[\\/]node_modules[\\/]pixi\.js[\\/]/,
          name: 'pixijs',
          chunks: 'all',
          priority: 30,
        },
      },
    }
    return config
  },
}

export default nextConfig
