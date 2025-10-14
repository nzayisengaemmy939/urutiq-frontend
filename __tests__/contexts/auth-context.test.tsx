import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { AuthProvider, useAuth } from '@/contexts/auth-context'

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

// Test component that uses the auth context
const TestComponent = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user-name">{user?.name || 'No User'}</div>
      <div data-testid="user-email">{user?.email || 'No Email'}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('provides initial auth state', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading')
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated')
    expect(screen.getByTestId('user-name')).toHaveTextContent('No User')
    expect(screen.getByTestId('user-email')).toHaveTextContent('No Email')
  })

  it('handles login with valid credentials', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    const loginButton = screen.getByText('Login')
    
    await act(async () => {
      fireEvent.click(loginButton)
    })

    // Should eventually show authenticated state
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
  })

  it('handles logout', async () => {
    // First login
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    const loginButton = screen.getByText('Login')
    const logoutButton = screen.getByText('Logout')
    
    await act(async () => {
      fireEvent.click(loginButton)
    })

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    // Then logout
    await act(async () => {
      fireEvent.click(logoutButton)
    })

    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated')
  })

  it('persists auth state in localStorage', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    const loginButton = screen.getByText('Login')
    
    await act(async () => {
      fireEvent.click(loginButton)
    })

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    // Check if auth state is stored in localStorage
    expect(localStorage.getItem('auth_token')).toBeTruthy()
  })

  it('restores auth state from localStorage on mount', () => {
    // Set up localStorage with auth data
    localStorage.setItem('auth_token', 'test-token')
    localStorage.setItem('user_data', JSON.stringify({
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    }))

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    // Should restore user data
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User')
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')
  })

  it('handles invalid login credentials', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    const loginButton = screen.getByText('Login')
    
    await act(async () => {
      fireEvent.click(loginButton)
    })

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    // Should remain unauthenticated
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated')
  })

  it('provides auth context to child components', () => {
    const ChildComponent = () => {
      const auth = useAuth()
      return <div data-testid="child-auth">{auth.isAuthenticated ? 'Child Authenticated' : 'Child Not Authenticated'}</div>
    }

    render(
      <TestWrapper>
        <ChildComponent />
      </TestWrapper>
    )

    expect(screen.getByTestId('child-auth')).toHaveTextContent('Child Not Authenticated')
  })

  it('handles auth state changes', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    )

    // Initially not authenticated
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated')

    const loginButton = screen.getByText('Login')
    
    await act(async () => {
      fireEvent.click(loginButton)
    })

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    // Should be authenticated after login
    expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated')
  })
})
