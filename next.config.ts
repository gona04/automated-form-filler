import type { NextConfig } from 'next'
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  /* Remove the testing files from being added in the bundle */
     outputFileTracingExcludes: {
      '*': [
        './node_modules/@testing-library/**',
        './node_modules/jest/**',
        './node_modules/ts-jest/**',
      ]
    }
}

export default withBundleAnalyzer(nextConfig)
