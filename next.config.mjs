/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },
  
  // Development-specific configurations
  ...(process.env.NODE_ENV === 'development' && {
    // Disable all caching in development
    generateEtags: false,
    poweredByHeader: false,
    compress: false,
    
    // Disable image optimization in development
    images: {
      unoptimized: true,
    },
  }),
  
  // Production-specific configurations
  ...(process.env.NODE_ENV === 'production' && {
    generateEtags: false,
    poweredByHeader: false,
    compress: true,
    
    // Image optimization for production
    images: {
      formats: ['image/webp', 'image/avif'],
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      minimumCacheTTL: 60,
    },
  }),
  
  // Headers configuration
  async headers() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // Development: Complete no-cache headers
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-cache, no-store, must-revalidate, max-age=0'
            },
            {
              key: 'Pragma',
              value: 'no-cache'
            },
            {
              key: 'Expires',
              value: '0'
            },
            {
              key: 'Last-Modified',
              value: new Date().toUTCString()
            },
            {
              key: 'ETag',
              value: `"${Date.now()}"`
            },
            // Security headers
            {
              key: 'X-DNS-Prefetch-Control',
              value: 'on'
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block'
            },
            {
              key: 'X-Frame-Options',
              value: 'SAMEORIGIN'
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff'
            },
            {
              key: 'Referrer-Policy',
              value: 'origin-when-cross-origin'
            }
          ]
        }
      ];
    } else {
      // Production: Normal caching headers
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-DNS-Prefetch-Control',
              value: 'on'
            },
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=63072000; includeSubDomains; preload'
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block'
            },
            {
              key: 'X-Frame-Options',
              value: 'SAMEORIGIN'
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff'
            },
            {
              key: 'Referrer-Policy',
              value: 'origin-when-cross-origin'
            }
          ]
        },
        {
          source: '/fonts/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable'
            }
          ]
        },
        {
          source: '/_next/static/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable'
            }
          ]
        }
      ];
    }
  },
  
  // Webpack configuration
  webpack: (config, { dev, isServer, webpack }) => {
    if (dev) {
      // Development: Disable contenthash and prevent browser caching
      config.output.filename = 'static/js/[name].js';
      config.output.chunkFilename = 'static/js/[name].js';
      config.output.assetModuleFilename = 'static/media/[name].[ext]';
      
      // Disable file hashing in development
      config.optimization.moduleIds = 'named';
      config.optimization.chunkIds = 'named';
      
      // Disable optimization in development for faster builds
      config.optimization.minimize = false;
      config.optimization.splitChunks = false;
      
      // Add cache busting environment variable
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.BUILD_TIME': JSON.stringify(Date.now().toString())
        })
      );
    } else {
      // Production: Normal optimization
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
};

export default nextConfig;
