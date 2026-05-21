import '@testing-library/jest-dom'

// Polyfill TextEncoder for tests
if (typeof global.TextEncoder === 'undefined') {
  const util = require('util')
  global.TextEncoder = util.TextEncoder
  global.TextDecoder = util.TextDecoder
}

// Polyfill ReadableStream for tests
if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = class ReadableStream {
    constructor(underlyingSource) {
      this.underlyingSource = underlyingSource
      this.chunks = []
    }

    async *[Symbol.asyncIterator]() {
      const controller = {
        enqueue: (chunk) => this.chunks.push(chunk),
      }
      this.underlyingSource?.enqueue?.(controller)
      for (const chunk of this.chunks) {
        yield chunk
      }
    }

    getReader() {
      const chunks = this.chunks
      let index = 0
      return {
        read: async () => {
          if (index < chunks.length) {
            return { done: false, value: chunks[index++] }
          }
          return { done: true, value: undefined }
        },
      }
    }
  }
}

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  redirect: jest.fn(),
}))

// Mock next/dynamic
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (...args) => {
    const dynamicModule = jest.requireActual('next/dynamic')
    const dynamicActualComp = dynamicModule.default
    const RequiredComponent = dynamicActualComp(args[0])
    RequiredComponent.preload ? RequiredComponent.preload() : RequiredComponent.render.preload()
    return RequiredComponent
  },
}))
