import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import DashboardPage from '@/app/dashboard/page'
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

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
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

// Mock the FinancialOverview component
jest.mock('@/components/financial-overview', () => ({
  FinancialOverview: () => <div data-testid="financial-overview">Financial Overview Component</div>,
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

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders dashboard page correctly', () => {
    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    expect(screen.getByTestId('protected-route')).toBeInTheDocument()
    expect(screen.getByTestId('page-layout')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Financial Overview & Analytics')).toBeInTheDocument()
  })

  it('displays welcome section with user information', () => {
    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    expect(screen.getByText('Welcome back, John Doe!')).toBeInTheDocument()
    expect(screen.getByText('Here\'s what\'s happening with your business today.')).toBeInTheDocument()
  })

  it('renders quick action buttons', () => {
    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    expect(screen.getByText('AI Insights')).toBeInTheDocument()
    expect(screen.getByText('Chart of Accounts')).toBeInTheDocument()
    expect(screen.getByText('Journal Entries')).toBeInTheDocument()
    expect(screen.getByText('Bank Reconciliation')).toBeInTheDocument()
  })

  it('renders financial overview component', () => {
    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    expect(screen.getByTestId('financial-overview')).toBeInTheDocument()
  })

  it('handles button clicks correctly', () => {
    const mockPush = jest.fn()
    jest.mocked(require('next/navigation').useRouter).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
    })

    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    const chartOfAccountsButton = screen.getByText('Chart of Accounts').closest('button')
    fireEvent.click(chartOfAccountsButton!)

    expect(mockPush).toHaveBeenCalledWith('/accounting')
  })

  it('displays export and analytics buttons', () => {
    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    expect(screen.getByText('Export Report')).toBeInTheDocument()
    expect(screen.getByText('View Analytics')).toBeInTheDocument()
  })

  it('renders responsive layout correctly', () => {
    render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )

    // Check for responsive classes
    const quickActionsGrid = screen.getByText('AI Insights').closest('div')?.parentElement
    expect(quickActionsGrid).toHaveClass('grid')
  })
})
