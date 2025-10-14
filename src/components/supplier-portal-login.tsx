import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { apiService } from '@/lib/api';

interface SupplierPortalLoginProps {
  onSuccess?: () => void;
}

export function SupplierPortalLogin({ onSuccess }: SupplierPortalLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // For demo purposes, we'll use a simple check
      // In a real implementation, you would have proper supplier authentication
      if (email && password) {
        // Mock supplier login - in real app, this would be a proper API call
        const mockSupplier = {
          id: 'supplier-demo-1',
          name: 'Demo Supplier Inc.',
          email: email,
          role: 'supplier',
          isActive: true
        };

        // Store supplier info in localStorage for demo
        localStorage.setItem('supplier_info', JSON.stringify(mockSupplier));
        
        // Use the regular login flow but with supplier role
        await login(email, password);
        
        onSuccess?.();
      } else {
        setError('Please enter both email and password');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Supplier Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your supplier dashboard and manage your account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>
              Enter your supplier credentials to access the portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="supplier@example.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Demo Credentials</span>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  For demo purposes, use any email and password:
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>Email:</strong> supplier@demo.com</p>
                  <p><strong>Password:</strong> demo123</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Contact your account manager
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
