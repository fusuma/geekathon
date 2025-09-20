/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance Optimizations
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react', 'framer-motion'],
  },
  
  // Turbopack configuration
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Image Optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compression and Bundle Optimization
  compress: true,
  productionBrowserSourceMaps: false,

  // Progressive Web App features
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
      ],
    },
    {
      source: '/fonts/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/_next/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        animations: {
          test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
          name: 'animations',
          chunks: 'all',
        },
        ui: {
          test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
          name: 'ui',
          chunks: 'all',
        },
      },
    };

    // Optimize imports
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': '/src',
      };
    }

    return config;
  },

  // Enable runtime optimizations
  // swcMinify is now enabled by default in Next.js 13+
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
      preventFullImport: true,
    },
    '@radix-ui/react-icons': {
      transform: '@radix-ui/react-icons/dist/{{member}}.js',
      preventFullImport: true,
    },
  },

  // Output configuration for static export optimization
  output: 'export', // Static export for Lambda deployment
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true, // Required for static export
  },

  // Enable runtime configuration
  publicRuntimeConfig: {
    NODE_ENV: process.env.NODE_ENV,
  },
};

export default nextConfig;
