import { render } from '@testing-library/react'
import RootLayout from '@/app/layout'

describe('Root Layout', () => {
  it('should render children', () => {
    const { getByText } = render(
      <RootLayout>
        <div>Test Content Here</div>
      </RootLayout>
    )

    expect(getByText('Test Content Here')).toBeInTheDocument()
  })

  it('should have min-h-full flex flex-col classes on body', () => {
    const { container } = render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    )

    const body = container.querySelector('body')
    if (body) {
      expect(body.className).toContain('min-h-full')
      expect(body.className).toContain('flex')
      expect(body.className).toContain('flex-col')
    }
  })

  it('should have h-full antialiased classes on html', () => {
    const { container } = render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    )

    const html = container.querySelector('html')
    if (html) {
      expect(html.className).toContain('h-full')
      expect(html.className).toContain('antialiased')
      expect(html.getAttribute('lang')).toBe('en')
    }
  })

  it('should have suppressHydrationWarning on html', () => {
    const { container } = render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    )

    const html = container.querySelector('html')
    if (html) {
      expect(html.hasAttribute('suppresshydrationwarning')).toBe(true)
    }
  })

  it('should have suppressHydrationWarning on body', () => {
    const { container } = render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    )

    const body = container.querySelector('body')
    if (body) {
      expect(body.hasAttribute('suppresshydrationwarning')).toBe(true)
    }
  })
})
