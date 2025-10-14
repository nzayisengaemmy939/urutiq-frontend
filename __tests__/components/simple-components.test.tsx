import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient()
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('Simple Components', () => {
  describe('Button Component', () => {
    it('renders button with text', () => {
      render(
        <TestWrapper>
          <Button>Click me</Button>
        </TestWrapper>
      )
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })

    it('handles click events', () => {
      const handleClick = jest.fn()
      render(
        <TestWrapper>
          <Button onClick={handleClick}>Click me</Button>
        </TestWrapper>
      )
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('renders different variants', () => {
      const { rerender } = render(
        <TestWrapper>
          <Button variant="default">Default</Button>
        </TestWrapper>
      )
      expect(screen.getByRole('button')).toBeInTheDocument()

      rerender(
        <TestWrapper>
          <Button variant="destructive">Destructive</Button>
        </TestWrapper>
      )
      expect(screen.getByRole('button')).toBeInTheDocument()

      rerender(
        <TestWrapper>
          <Button variant="outline">Outline</Button>
        </TestWrapper>
      )
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders different sizes', () => {
      const { rerender } = render(
        <TestWrapper>
          <Button size="default">Default</Button>
        </TestWrapper>
      )
      expect(screen.getByRole('button')).toBeInTheDocument()

      rerender(
        <TestWrapper>
          <Button size="sm">Small</Button>
        </TestWrapper>
      )
      expect(screen.getByRole('button')).toBeInTheDocument()

      rerender(
        <TestWrapper>
          <Button size="lg">Large</Button>
        </TestWrapper>
      )
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('handles disabled state', () => {
      render(
        <TestWrapper>
          <Button disabled>Disabled</Button>
        </TestWrapper>
      )
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('Card Component', () => {
    it('renders card with header and content', () => {
      render(
        <TestWrapper>
          <Card>
            <CardHeader>
              <CardTitle>Test Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Card content</p>
            </CardContent>
          </Card>
        </TestWrapper>
      )
      
      expect(screen.getByText('Test Card')).toBeInTheDocument()
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('renders card without header', () => {
      render(
        <TestWrapper>
          <Card>
            <CardContent>
              <p>Card content only</p>
            </CardContent>
          </Card>
        </TestWrapper>
      )
      
      expect(screen.getByText('Card content only')).toBeInTheDocument()
    })
  })

  describe('Badge Component', () => {
    it('renders badge with text', () => {
      render(
        <TestWrapper>
          <Badge>Test Badge</Badge>
        </TestWrapper>
      )
      expect(screen.getByText('Test Badge')).toBeInTheDocument()
    })

    it('renders different variants', () => {
      const { rerender } = render(
        <TestWrapper>
          <Badge variant="default">Default</Badge>
        </TestWrapper>
      )
      expect(screen.getByText('Default')).toBeInTheDocument()

      rerender(
        <TestWrapper>
          <Badge variant="secondary">Secondary</Badge>
        </TestWrapper>
      )
      expect(screen.getByText('Secondary')).toBeInTheDocument()

      rerender(
        <TestWrapper>
          <Badge variant="destructive">Destructive</Badge>
        </TestWrapper>
      )
      expect(screen.getByText('Destructive')).toBeInTheDocument()

      rerender(
        <TestWrapper>
          <Badge variant="outline">Outline</Badge>
        </TestWrapper>
      )
      expect(screen.getByText('Outline')).toBeInTheDocument()
    })
  })

  describe('Progress Component', () => {
    it('renders progress bar', () => {
      render(
        <TestWrapper>
          <Progress value={50} />
        </TestWrapper>
      )
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toBeInTheDocument()
      expect(progressBar).toHaveAttribute('aria-valuenow', '50')
    })

    it('renders progress with different values', () => {
      const { rerender } = render(
        <TestWrapper>
          <Progress value={0} />
        </TestWrapper>
      )
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')

      rerender(
        <TestWrapper>
          <Progress value={100} />
        </TestWrapper>
      )
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
    })
  })

  describe('Input Component', () => {
    it('renders input field', () => {
      render(
        <TestWrapper>
          <Input placeholder="Enter text" />
        </TestWrapper>
      )
      
      const input = screen.getByPlaceholderText('Enter text')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
    })

    it('handles input changes', () => {
      const handleChange = jest.fn()
      render(
        <TestWrapper>
          <Input onChange={handleChange} placeholder="Enter text" />
        </TestWrapper>
      )
      
      const input = screen.getByPlaceholderText('Enter text')
      fireEvent.change(input, { target: { value: 'test input' } })
      
      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(input).toHaveValue('test input')
    })

    it('renders different input types', () => {
      const { rerender } = render(
        <TestWrapper>
          <Input type="email" placeholder="Email" />
        </TestWrapper>
      )
      expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email')

      rerender(
        <TestWrapper>
          <Input type="password" placeholder="Password" />
        </TestWrapper>
      )
      expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password')
    })
  })
})
