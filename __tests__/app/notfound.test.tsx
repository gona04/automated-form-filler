import { render, screen } from '@testing-library/react'
import NotFound from '@/app/not-found'

describe('Not Found Page', () => {
  it('should render not found message', () => {
    render(<NotFound />)
    expect(screen.getByText(/Sorry this page was not found/i)).toBeInTheDocument()
  })

  it('should have correct layout classes', () => {
    const { container } = render(<NotFound />)
    const div = container.querySelector('div')
    expect(div).toHaveClass('flex')
    expect(div).toHaveClass('justify-center')
    expect(div).toHaveClass('w-full')
    expect(div).toHaveClass('h-screen')
    expect(div).toHaveClass('items-center')
  })
})
