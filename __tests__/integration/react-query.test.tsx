import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'

// Mock API service
const mockApiService = {
  getCompanies: jest.fn(),
  getProducts: jest.fn(),
  getVendors: jest.fn(),
  createInvoice: jest.fn(),
  updateInvoice: jest.fn(),
  deleteInvoice: jest.fn(),
}

// Mock component that uses React Query
const TestComponent = () => {
  const { data: companies, isLoading: companiesLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => mockApiService.getCompanies(),
  })

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => mockApiService.getProducts(),
  })

  const createInvoiceMutation = useMutation({
    mutationFn: (data: any) => mockApiService.createInvoice(data),
  })

  if (companiesLoading || productsLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div data-testid="companies-count">{companies?.length || 0}</div>
      <div data-testid="products-count">{products?.length || 0}</div>
      <button 
        data-testid="create-invoice"
        onClick={() => createInvoiceMutation.mutate({ amount: 100 })}
      >
        Create Invoice
      </button>
      {createInvoiceMutation.isPending && <div data-testid="creating">Creating...</div>}
    </div>
  )
}

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

describe('React Query Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('handles successful queries', async () => {
    mockApiService.getCompanies.mockResolvedValue([
      { id: '1', name: 'Company A' },
      { id: '2', name: 'Company B' },
    ])
    
    mockApiService.getProducts.mockResolvedValue([
      { id: '1', name: 'Product A' },
      { id: '2', name: 'Product B' },
      { id: '3', name: 'Product C' },
    ])

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('companies-count')).toHaveTextContent('2')
      expect(screen.getByTestId('products-count')).toHaveTextContent('3')
    })

    expect(mockApiService.getCompanies).toHaveBeenCalledTimes(1)
    expect(mockApiService.getProducts).toHaveBeenCalledTimes(1)
  })

  it('handles query errors gracefully', async () => {
    mockApiService.getCompanies.mockRejectedValue(new Error('API Error'))
    mockApiService.getProducts.mockResolvedValue([])

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('products-count')).toHaveTextContent('0')
    })

    // Companies query should fail but component should still render
    expect(screen.getByTestId('companies-count')).toHaveTextContent('0')
  })

  it('handles mutations correctly', async () => {
    mockApiService.getCompanies.mockResolvedValue([])
    mockApiService.getProducts.mockResolvedValue([])
    mockApiService.createInvoice.mockResolvedValue({ id: '1', amount: 100 })

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('create-invoice')).toBeInTheDocument()
    })

    const createButton = screen.getByTestId('create-invoice')
    createButton.click()

    await waitFor(() => {
      expect(screen.getByTestId('creating')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.queryByTestId('creating')).not.toBeInTheDocument()
    })

    expect(mockApiService.createInvoice).toHaveBeenCalledWith({ amount: 100 })
  })

  it('handles mutation errors', async () => {
    mockApiService.getCompanies.mockResolvedValue([])
    mockApiService.getProducts.mockResolvedValue([])
    mockApiService.createInvoice.mockRejectedValue(new Error('Mutation Error'))

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByTestId('create-invoice')).toBeInTheDocument()
    })

    const createButton = screen.getByTestId('create-invoice')
    createButton.click()

    await waitFor(() => {
      expect(screen.getByTestId('creating')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.queryByTestId('creating')).not.toBeInTheDocument()
    })

    expect(mockApiService.createInvoice).toHaveBeenCalledWith({ amount: 100 })
  })

  it('caches queries correctly', async () => {
    mockApiService.getCompanies.mockResolvedValue([{ id: '1', name: 'Company A' }])
    mockApiService.getProducts.mockResolvedValue([{ id: '1', name: 'Product A' }])

    const queryClient = createTestQueryClient()
    
    const TestWrapperWithClient = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    )

    const { rerender } = render(
      <TestWrapperWithClient>
        <TestComponent />
      </TestWrapperWithClient>
    )

    await waitFor(() => {
      expect(screen.getByTestId('companies-count')).toHaveTextContent('1')
    })

    // Rerender the component
    rerender(
      <TestWrapperWithClient>
        <TestComponent />
      </TestWrapperWithClient>
    )

    // API should only be called once due to caching
    expect(mockApiService.getCompanies).toHaveBeenCalledTimes(1)
    expect(mockApiService.getProducts).toHaveBeenCalledTimes(1)
  })

  it('handles concurrent queries', async () => {
    mockApiService.getCompanies.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve([{ id: '1', name: 'Company A' }]), 100))
    )
    mockApiService.getProducts.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve([{ id: '1', name: 'Product A' }]), 50))
    )

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    // Should show loading initially
    expect(screen.getByText('Loading...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByTestId('companies-count')).toHaveTextContent('1')
      expect(screen.getByTestId('products-count')).toHaveTextContent('1')
    })

    expect(mockApiService.getCompanies).toHaveBeenCalledTimes(1)
    expect(mockApiService.getProducts).toHaveBeenCalledTimes(1)
  })
})
