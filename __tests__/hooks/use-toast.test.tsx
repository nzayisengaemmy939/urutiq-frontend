import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { useToast } from '@/hooks/use-toast'
import { ToastProvider } from '@/components/toast-provider'

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
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

// Test component that uses the toast hook
const TestComponent = () => {
  const { toast } = useToast()
  
  return (
    <div>
      <button onClick={() => toast({ title: 'Success', description: 'Operation completed successfully' })}>
        Show Success Toast
      </button>
      <button onClick={() => toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' })}>
        Show Error Toast
      </button>
      <button onClick={() => toast({ title: 'Info', description: 'Here is some information' })}>
        Show Info Toast
      </button>
    </div>
  )
}

describe('useToast Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders toast hook without errors', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    expect(screen.getByText('Show Success Toast')).toBeInTheDocument()
    expect(screen.getByText('Show Error Toast')).toBeInTheDocument()
    expect(screen.getByText('Show Info Toast')).toBeInTheDocument()
  })

  it('shows success toast', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    const successButton = screen.getByText('Show Success Toast')
    fireEvent.click(successButton)

    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument()
      expect(screen.getByText('Operation completed successfully')).toBeInTheDocument()
    })
  })

  it('shows error toast', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    const errorButton = screen.getByText('Show Error Toast')
    fireEvent.click(errorButton)

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })
  })

  it('shows info toast', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    const infoButton = screen.getByText('Show Info Toast')
    fireEvent.click(infoButton)

    await waitFor(() => {
      expect(screen.getByText('Info')).toBeInTheDocument()
      expect(screen.getByText('Here is some information')).toBeInTheDocument()
    })
  })

  it('handles multiple toasts', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    const successButton = screen.getByText('Show Success Toast')
    const errorButton = screen.getByText('Show Error Toast')
    
    fireEvent.click(successButton)
    fireEvent.click(errorButton)

    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument()
      expect(screen.getByText('Error')).toBeInTheDocument()
    })
  })

  it('provides toast function', () => {
    let toastFunction: any = null
    
    const TestComponentWithToast = () => {
      const { toast } = useToast()
      toastFunction = toast
      return <div>Test</div>
    }

    render(
      <TestWrapper>
        <TestComponentWithToast />
      </TestWrapper>
    )

    expect(toastFunction).toBeDefined()
    expect(typeof toastFunction).toBe('function')
  })
})
