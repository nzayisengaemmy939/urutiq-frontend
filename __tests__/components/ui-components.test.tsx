import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

describe('UI Components', () => {
  describe('Button', () => {
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

  describe('Card', () => {
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

  describe('Badge', () => {
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

  describe('Tabs', () => {
    it('renders tabs with content', () => {
      render(
        <TestWrapper>
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Content 1</TabsContent>
            <TabsContent value="tab2">Content 2</TabsContent>
          </Tabs>
        </TestWrapper>
      )
      
      expect(screen.getByText('Tab 1')).toBeInTheDocument()
      expect(screen.getByText('Tab 2')).toBeInTheDocument()
      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })

    it('switches between tabs', () => {
      render(
        <TestWrapper>
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Content 1</TabsContent>
            <TabsContent value="tab2">Content 2</TabsContent>
          </Tabs>
        </TestWrapper>
      )
      
      fireEvent.click(screen.getByText('Tab 2'))
      expect(screen.getByText('Content 2')).toBeInTheDocument()
    })
  })

  describe('Progress', () => {
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

  describe('Input', () => {
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

  describe('Select', () => {
    it('renders select component', () => {
      render(
        <TestWrapper>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
            </SelectContent>
          </Select>
        </TestWrapper>
      )
      
      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByText('Select option')).toBeInTheDocument()
    })

    it('opens select dropdown', () => {
      render(
        <TestWrapper>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
            </SelectContent>
          </Select>
        </TestWrapper>
      )
      
      const selectTrigger = screen.getByRole('combobox')
      fireEvent.click(selectTrigger)
      
      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
    })
  })
})
