import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import AIInsightsPage from '@/app/ai-insights/page'
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

describe('AIInsightsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders AI insights page correctly', () => {
    render(
      <TestWrapper>
        <AIInsightsPage />
      </TestWrapper>
    )

    expect(screen.getByTestId('protected-route')).toBeInTheDocument()
    expect(screen.getByTestId('page-layout')).toBeInTheDocument()
    expect(screen.getByText('AI Insights & Predictions')).toBeInTheDocument()
    expect(screen.getByText('Leverage AI to optimize your financial performance and predict trends')).toBeInTheDocument()
  })

  it('displays header buttons', () => {
    render(
      <TestWrapper>
        <AIInsightsPage />
      </TestWrapper>
    )

    expect(screen.getByText('AI Settings')).toBeInTheDocument()
    expect(screen.getByText('Generate Insights')).toBeInTheDocument()
  })

  it('renders tabs correctly', () => {
    render(
      <TestWrapper>
        <AIInsightsPage />
      </TestWrapper>
    )

    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Predictions')).toBeInTheDocument()
    expect(screen.getByText('Anomalies')).toBeInTheDocument()
    expect(screen.getByText('Recommendations')).toBeInTheDocument()
  })

  it('switches between tabs correctly', async () => {
    render(
      <TestWrapper>
        <AIInsightsPage />
      </TestWrapper>
    )

    const predictionsTab = screen.getByText('Predictions')
    fireEvent.click(predictionsTab)

    await waitFor(() => {
      expect(screen.getByText('Cash Flow Forecast')).toBeInTheDocument()
    })
  })

  it('displays AI insights cards', () => {
    render(
      <TestWrapper>
        <AIInsightsPage />
      </TestWrapper>
    )

    expect(screen.getByText('Cash Flow Optimization')).toBeInTheDocument()
    expect(screen.getByText('Expense Anomaly Detected')).toBeInTheDocument()
    expect(screen.getByText('Revenue Growth Prediction')).toBeInTheDocument()
  })

  it('renders prediction charts', () => {
    render(
      <TestWrapper>
        <AIInsightsPage />
      </TestWrapper>
    )

    // Switch to predictions tab
    const predictionsTab = screen.getByText('Predictions')
    fireEvent.click(predictionsTab)

    expect(screen.getByText('Cash Flow Forecast')).toBeInTheDocument()
    expect(screen.getByText('Revenue Prediction')).toBeInTheDocument()
  })

  it('displays anomaly detection section', () => {
    render(
      <TestWrapper>
        <AIInsightsPage />
      </TestWrapper>
    )

    // Switch to anomalies tab
    const anomaliesTab = screen.getByText('Anomalies')
    fireEvent.click(anomaliesTab)

    expect(screen.getByText('Anomaly Detection')).toBeInTheDocument()
    expect(screen.getByText('Unusual Transactions')).toBeInTheDocument()
  })

  it('shows recommendations section', () => {
    render(
      <TestWrapper>
        <AIInsightsPage />
      </TestWrapper>
    )

    // Switch to recommendations tab
    const recommendationsTab = screen.getByText('Recommendations')
    fireEvent.click(recommendationsTab)

    expect(screen.getByText('AI Recommendations')).toBeInTheDocument()
  })

  it('handles button interactions', () => {
    render(
      <TestWrapper>
        <AIInsightsPage />
      </TestWrapper>
    )

    const generateInsightsButton = screen.getByText('Generate Insights')
    expect(generateInsightsButton).toBeInTheDocument()
    
    fireEvent.click(generateInsightsButton)
    // Button should still be present after click
    expect(generateInsightsButton).toBeInTheDocument()
  })
})
