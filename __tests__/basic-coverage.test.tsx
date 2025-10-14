import React from 'react'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

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

describe('Basic Coverage Tests', () => {
  describe('Button Component', () => {
    it('renders button with text', () => {
      render(
        <TestWrapper>
          <Button>Click me</Button>
        </TestWrapper>
      )
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
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
    })

    it('renders progress with different values', () => {
      const { rerender } = render(
        <TestWrapper>
          <Progress value={0} />
        </TestWrapper>
      )
      expect(screen.getByRole('progressbar')).toBeInTheDocument()

      rerender(
        <TestWrapper>
          <Progress value={100} />
        </TestWrapper>
      )
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
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
    })

    it('renders different input types', () => {
      const { rerender } = render(
        <TestWrapper>
          <Input type="email" placeholder="Email" />
        </TestWrapper>
      )
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()

      rerender(
        <TestWrapper>
          <Input type="password" placeholder="Password" />
        </TestWrapper>
      )
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    })
  })

  describe('Utils Functions', () => {
    it('cn function combines class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('cn function handles conditional classes', () => {
      expect(cn('base', true && 'conditional')).toBe('base conditional')
      expect(cn('base', false && 'conditional')).toBe('base')
    })

    it('cn function handles undefined and null values', () => {
      expect(cn('base', undefined, null)).toBe('base')
    })

    it('cn function handles empty strings', () => {
      expect(cn('base', '')).toBe('base')
    })

    it('cn function handles complex combinations', () => {
      expect(cn('base', 'class1', true && 'conditional', false && 'hidden')).toBe('base class1 conditional')
    })
  })

  describe('Component Integration', () => {
    it('renders multiple components together', () => {
      render(
        <TestWrapper>
          <Card>
            <CardHeader>
              <CardTitle>Test Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Badge variant="default">Status: Active</Badge>
                <Progress value={75} />
                <Input placeholder="Enter value" />
                <Button>Submit</Button>
              </div>
            </CardContent>
          </Card>
        </TestWrapper>
      )
      
      expect(screen.getByText('Test Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Status: Active')).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
    })
  })

  describe('Theme Integration', () => {
    it('renders components with theme provider', () => {
      render(
        <TestWrapper>
          <div className="bg-background text-foreground">
            <Button>Themed Button</Button>
            <Badge>Themed Badge</Badge>
          </div>
        </TestWrapper>
      )
      
      expect(screen.getByRole('button', { name: 'Themed Button' })).toBeInTheDocument()
      expect(screen.getByText('Themed Badge')).toBeInTheDocument()
    })
  })

  describe('React Query Integration', () => {
    it('renders components with query client provider', () => {
      render(
        <TestWrapper>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Data Loading</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={0} />
                <p>Loading data...</p>
              </CardContent>
            </Card>
          </div>
        </TestWrapper>
      )
      
      expect(screen.getByText('Data Loading')).toBeInTheDocument()
      expect(screen.getByText('Loading data...')).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })
  })
})
