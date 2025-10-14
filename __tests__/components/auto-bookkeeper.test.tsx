import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import AutoBookkeeperPage from '@/app/auto-bookkeeper/page'
import { AuthProvider } from '@/contexts/auth-context'

// Mock the auth context
jest.mock('@/contexts/auth-context', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: { id: '1', name: 'John Doe', email: 'john@example.com' },
    isAuthenticated: true,
    isLoading: false,
  }),
}))

// Mock the PageLayout component
jest.mock('@/components/page-layout', () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="page-layout">{children}</div>,
}))

// Mock the ProtectedRoute component
jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div data-testid="protected-route">{children}</div>,
}))

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
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

describe('AutoBookkeeperPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders auto-bookkeeper page correctly', () => {
    render(
      <TestWrapper>
        <AutoBookkeeperPage />
      </TestWrapper>
    )

    expect(screen.getByTestId('protected-route')).toBeInTheDocument()
    expect(screen.getByTestId('page-layout')).toBeInTheDocument()
    expect(screen.getByText('Auto-Bookkeeper Dashboard')).toBeInTheDocument()
    expect(screen.getByText('AI-powered automated bookkeeping and transaction processing')).toBeInTheDocument()
  })

  it('displays header buttons', () => {
    render(
      <TestWrapper>
        <AutoBookkeeperPage />
      </TestWrapper>
    )

    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Train AI')).toBeInTheDocument()
  })

  it('renders key metrics cards', () => {
    render(
      <TestWrapper>
        <AutoBookkeeperPage />
      </TestWrapper>
    )

    expect(screen.getByText('Auto-Processed')).toBeInTheDocument()
    expect(screen.getByText('AI Accuracy')).toBeInTheDocument()
    expect(screen.getByText('Pending Review')).toBeInTheDocument()
    expect(screen.getByText('Time Saved')).toBeInTheDocument()
  })

  it('displays metric values', () => {
    render(
      <TestWrapper>
        <AutoBookkeeperPage />
      </TestWrapper>
    )

    expect(screen.getByText('1,247')).toBeInTheDocument() // Auto-Processed
    expect(screen.getByText('94.2%')).toBeInTheDocument() // AI Accuracy
    expect(screen.getByText('23')).toBeInTheDocument() // Pending Review
    expect(screen.getByText('47h')).toBeInTheDocument() // Time Saved
  })

  it('renders tabs correctly', () => {
    render(
      <TestWrapper>
        <AutoBookkeeperPage />
      </TestWrapper>
    )

    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Auto-Processing')).toBeInTheDocument()
    expect(screen.getByText('AI Learning')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('switches between tabs correctly', async () => {
    render(
      <TestWrapper>
        <AutoBookkeeperPage />
      </TestWrapper>
    )

    const processingTab = screen.getByText('Auto-Processing')
    fireEvent.click(processingTab)

    await waitFor(() => {
      expect(screen.getByText('Auto-Processing Rules')).toBeInTheDocument()
    })
  })

  it('displays processing status in overview tab', () => {
    render(
      <TestWrapper>
        <AutoBookkeeperPage />
      </TestWrapper>
    )

    expect(screen.getByText('Processing Status')).toBeInTheDocument()
    expect(screen.getByText('Receipt Processing')).toBeInTheDocument()
    expect(screen.getByText('Invoice Matching')).toBeInTheDocument()
    expect(screen.getByText('Expense Categorization')).toBeInTheDocument()
  })

  it('shows recent activity', () => {
    render(
      <TestWrapper>
        <AutoBookkeeperPage />
      </TestWrapper>
    )

    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    expect(screen.getByText('Auto-processed 15 receipts')).toBeInTheDocument()
    expect(screen.getByText('AI learned new vendor pattern')).toBeInTheDocument()
    expect(screen.getByText('3 transactions need review')).toBeInTheDocument()
  })

  it('displays auto-processing rules', () => {
    render(
      <TestWrapper>
        <AutoBookkeeperPage />
      </TestWrapper>
    )

    // Switch to auto-processing tab
    const processingTab = screen.getByText('Auto-Processing')
    fireEvent.click(processingTab)

    expect(screen.getByText('Receipt Processing')).toBeInTheDocument()
    expect(screen.getByText('Invoice Matching')).toBeInTheDocument()
    expect(screen.getByText('Bank Reconciliation')).toBeInTheDocument()
    expect(screen.getByText('Tax Categorization')).toBeInTheDocument()
  })

  it('shows AI learning progress', () => {
    render(
      <TestWrapper>
        <AutoBookkeeperPage />
      </TestWrapper>
    )

    // Switch to AI learning tab
    const learningTab = screen.getByText('AI Learning')
    fireEvent.click(learningTab)

    expect(screen.getByText('AI Learning Progress')).toBeInTheDocument()
    expect(screen.getByText('Model Performance')).toBeInTheDocument()
    expect(screen.getByText('Learning Insights')).toBeInTheDocument()
  })

  it('displays learning insights', () => {
    render(
      <TestWrapper>
        <AutoBookkeeperPage />
      </TestWrapper>
    )

    // Switch to AI learning tab
    const learningTab = screen.getByText('AI Learning')
    fireEvent.click(learningTab)

    expect(screen.getByText('New Vendor Pattern Detected')).toBeInTheDocument()
    expect(screen.getByText('Accuracy Improvement')).toBeInTheDocument()
    expect(screen.getByText('New Category Learned')).toBeInTheDocument()
  })

  it('shows settings configuration', () => {
    render(
      <TestWrapper>
        <AutoBookkeeperPage />
      </TestWrapper>
    )

    // Switch to settings tab
    const settingsTab = screen.getByText('Settings')
    fireEvent.click(settingsTab)

    expect(screen.getByText('Auto-Bookkeeper Settings')).toBeInTheDocument()
    expect(screen.getByText('Processing Rules')).toBeInTheDocument()
    expect(screen.getByText('AI Learning')).toBeInTheDocument()
  })

  it('displays processing rule settings', () => {
    render(
      <TestWrapper>
        <AutoBookkeeperPage />
      </TestWrapper>
    )

    // Switch to settings tab
    const settingsTab = screen.getByText('Settings')
    fireEvent.click(settingsTab)

    expect(screen.getByText('Auto-categorize receipts')).toBeInTheDocument()
    expect(screen.getByText('Auto-match invoices')).toBeInTheDocument()
    expect(screen.getByText('Auto-reconcile bank')).toBeInTheDocument()
  })

  it('shows AI learning settings', () => {
    render(
      <TestWrapper>
        <AutoBookkeeperPage />
      </TestWrapper>
    )

    // Switch to settings tab
    const settingsTab = screen.getByText('Settings')
    fireEvent.click(settingsTab)

    expect(screen.getByText('Continuous learning')).toBeInTheDocument()
    expect(screen.getByText('Confidence threshold')).toBeInTheDocument()
  })

  it('handles button interactions', () => {
    render(
      <TestWrapper>
        <AutoBookkeeperPage />
      </TestWrapper>
    )

    const trainAIButton = screen.getByText('Train AI')
    expect(trainAIButton).toBeInTheDocument()
    
    fireEvent.click(trainAIButton)
    // Button should still be present after click
    expect(trainAIButton).toBeInTheDocument()
  })
})
