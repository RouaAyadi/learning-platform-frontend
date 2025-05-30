'use client'

import { ApolloWrapper } from '@/lib/apollo-wrapper'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ApolloWrapper>{children}</ApolloWrapper>
    </QueryClientProvider>
  )
} 