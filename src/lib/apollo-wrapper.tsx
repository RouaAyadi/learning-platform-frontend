'use client'

import { ApolloClient, ApolloProvider, InMemoryCache, HttpLink, from } from '@apollo/client'
import { onError } from '@apollo/client/link/error'

function makeClient() {
  const httpLink = new HttpLink({
    uri: 'http://localhost:3300/graphql',
    credentials: 'include',
  })

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      })
    }
    if (networkError) {
      console.error(`[Network error]:`, networkError)
    }
  })

  return new ApolloClient({
    link: from([errorLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'network-only',
      },
      query: {
        fetchPolicy: 'network-only',
      },
    },
    credentials: 'include',
  })
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloProvider client={makeClient()}>
      {children}
    </ApolloProvider>
  )
}