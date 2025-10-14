import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import BankingPage from '@/app/banking/page'
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

// Mock the banking API
jest.mock('@/lib/api/banking', () => ({
  bankingApi: {
    getAccounts: jest.fn(() => Promise.resolve({
      data: [
        { id: '1', name: 'Main Checking', balance: 5000, type: 'checking' },
        { id: '2', name: 'Business Savings', balance: 15000, type: 'savings' },
      ]
    })),
    getTransactions: jest.fn(() => Promise.resolve({
      data: [
        { id: '1', amount: -100, description: 'Office Supplies', date: '2024-01-15' },
        { id: '2', amount: 500, description: 'Client Payment', date: '2024-01-14' },
      ]
    })),
  },
  BankAccount: {},
  BankTransaction: {},
  Payment: {},
}))

// Mock the CashFlowForecast component
jest.mock('@/components/cash-flow-forecast', () => ({
  CashFlowForecast: () => <div data-testid="cash-flow-forecast">Cash Flow Forecast Component</div>,
}))

// Mock the AICategorization component
jest.mock('@/components/ai-categorization', () => ({
  AICategorization: () => <div data-testid="ai-categorization">AI Categorization Component</div>,
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

describe('BankingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders banking page correctly', () => {
    render(
      <TestWrapper>
        <BankingPage />
      </TestWrapper>
    )

    expect(screen.getByTestId('page-layout')).toBeInTheDocument()
    expect(screen.getByText('Banking & Cash Management')).toBeInTheDocument()
  })

  it('displays header buttons', () => {
    render(
      <TestWrapper>
        <BankingPage />
      </TestWrapper>
    )

    expect(screen.getByText('Connect Bank')).toBeInTheDocument()
    expect(screen.getByText('Add Account')).toBeInTheDocument()
  })

  it('renders tabs correctly', () => {
    render(
      <TestWrapper>
        <BankingPage />
      </TestWrapper>
    )

    expect(screen.getByText('Accounts')).toBeInTheDocument()
    expect(screen.getByText('Transactions')).toBeInTheDocument()
    expect(screen.getByText('Reconciliation')).toBeInTheDocument()
    expect(screen.getByText('AI Insights')).toBeInTheDocument()
  })

  it('switches between tabs correctly', async () => {
    render(
      <TestWrapper>
        <BankingPage />
      </TestWrapper>
    )

    const transactionsTab = screen.getByText('Transactions')
    fireEvent.click(transactionsTab)

    await waitFor(() => {
      expect(screen.getByText('Transaction History')).toBeInTheDocument()
    })
  })

  it('displays bank accounts', async () => {
    render(
      <TestWrapper>
        <BankingPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Main Checking')).toBeInTheDocument()
      expect(screen.getByText('Business Savings')).toBeInTheDocument()
    })
  })

  it('shows transaction data', async () => {
    render(
      <TestWrapper>
        <BankingPage />
      </TestWrapper>
    )

    // Switch to transactions tab
    const transactionsTab = screen.getByText('Transactions')
    fireEvent.click(transactionsTab)

    await waitFor(() => {
      expect(screen.getByText('Office Supplies')).toBeInTheDocument()
      expect(screen.getByText('Client Payment')).toBeInTheDocument()
    })
  })

  it('renders reconciliation section', () => {
    render(
      <TestWrapper>
        <BankingPage />
      </TestWrapper>
    )

    // Switch to reconciliation tab
    const reconciliationTab = screen.getByText('Reconciliation')
    fireEvent.click(reconciliationTab)

    expect(screen.getByText('Bank Reconciliation')).toBeInTheDocument()
  })

  it('displays AI insights components', () => {
    render(
      <TestWrapper>
        <BankingPage />
      </TestWrapper>
    )

    // Switch to AI insights tab
    const aiInsightsTab = screen.getByText('AI Insights')
    fireEvent.click(aiInsightsTab)

    expect(screen.getByTestId('cash-flow-forecast')).toBeInTheDocument()
    expect(screen.getByTestId('ai-categorization')).toBeInTheDocument()
  })

  it('handles search functionality', () => {
    render(
      <TestWrapper>
        <BankingPage />
      </TestWrapper>
    )

    const searchInput = screen.getByPlaceholderText('Search transactions...')
    expect(searchInput).toBeInTheDocument()
    
    fireEvent.change(searchInput, { target: { value: 'office' } })
    expect(searchInput).toHaveValue('office')
  })

  it('displays filter options', () => {
    render(
      <TestWrapper>
        <BankingPage />
      </TestWrapper>
    )

    expect(screen.getByText('All Accounts')).toBeInTheDocument()
    expect(screen.getByText('All Types')).toBeInTheDocument()
  })
})
