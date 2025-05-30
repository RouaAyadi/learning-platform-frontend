'use client'

import { ApolloClient, ApolloProvider, InMemoryCache, split, HttpLink } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'

function makeClient() {
  const httpLink = new HttpLink({
    uri: 'http://localhost:3000/graphql',
    credentials: 'include'
  })

  const wsLink = typeof window !== 'undefined'
    ? new GraphQLWsLink(createClient({
        url: 'ws://localhost:3000/graphql',
      }))
    : null

  const splitLink = typeof window !== 'undefined' && wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query)
          return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
          )
        },
        wsLink,
        httpLink
      )
    : httpLink

  return new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
  })
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloProvider client={makeClient()}>
      {children}
    </ApolloProvider>
  )
} 