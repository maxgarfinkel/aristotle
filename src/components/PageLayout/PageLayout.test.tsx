import { render, screen } from '@testing-library/react'
import PageLayout from './PageLayout'

describe('PageLayout', () => {
  it('renders children', () => {
    render(<PageLayout><p>Hello world</p></PageLayout>)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders the site header', () => {
    render(<PageLayout><p>content</p></PageLayout>)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders a main landmark', () => {
    render(<PageLayout><p>content</p></PageLayout>)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('applies the max-w-lg class when maxWidth is lg', () => {
    const { container } = render(<PageLayout maxWidth="lg"><p>content</p></PageLayout>)
    expect(container.querySelector('.max-w-lg')).toBeInTheDocument()
  })

  it('applies the max-w-2xl class by default', () => {
    const { container } = render(<PageLayout><p>content</p></PageLayout>)
    expect(container.querySelector('.max-w-2xl')).toBeInTheDocument()
  })
})
