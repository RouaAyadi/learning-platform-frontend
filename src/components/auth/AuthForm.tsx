'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/api';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      if (mode === 'login') {
        const response = await authApi.login(email, password);
        if (response.access_token) {
          login(response.access_token);
          router.push('/dashboard');
        } else {
          setError('Invalid response from server: No access token received');
        }
      } else {
        const name = formData.get('name') as string;
        if (!name || name.trim().length < 2) {
          setError('Name must be at least 2 characters long');
          setLoading(false);
          return;
        }
        if (!email || !email.includes('@')) {
          setError('Please enter a valid email address');
          setLoading(false);
          return;
        }
        if (!password || password.length < 6) {
          setError('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }

        // First register the user
        await authApi.register(name.trim(), email, password);
        
        // Then automatically log them in
        const loginResponse = await authApi.login(email, password);
        if (loginResponse.access_token) {
          login(loginResponse.access_token);
          router.push('/dashboard');
        } else {
          setError('Registration successful but login failed. Please try logging in manually.');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      // Get the most specific error message available
      const errorMessage = err.response?.data?.message || // Custom message from server
                          err.response?.data?.error || // Error field from server
                          err.response?.data || // Raw error data
                          err.message || // Error message
                          'An error occurred during authentication';
      
      setError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-base-200 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-center">
        {mode === 'login' ? 'Sign In' : 'Create Account'}
      </h2>
      
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input
              type="text"
              name="name"
              required
              minLength={2}
              className="input input-bordered w-full"
              placeholder="Enter your name"
            />
          </div>
        )}

        <div className="form-control">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            type="email"
            name="email"
            required
            className="input input-bordered w-full"
            placeholder="Enter your email"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Password</span>
          </label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="input input-bordered w-full"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? (
            <span className="loading loading-spinner"></span>
          ) : mode === 'login' ? (
            'Sign In'
          ) : (
            'Create Account'
          )}
        </button>
      </form>
    </div>
  );
} 