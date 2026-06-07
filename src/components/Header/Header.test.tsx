import { render, screen } from '@testing-library/react'
import Header from './Header'

describe('Header', () => {
  it('renders the site name', () => {
    render(<Header />)
    expect(screen.getByText('Aristotle')).toBeInTheDocument()
  })

  it('renders a header landmark', () => {
    render(<Header />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })
})
