import { render, screen } from '@testing-library/react'
import Home from '@/app/page'
import { redirect } from 'next/navigation'

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

describe('Home Page', () => {
  it('should redirect to /chat', () => {
    render(<Home />)
    expect(redirect).toHaveBeenCalledWith('/chat')
  })
})
