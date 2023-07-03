import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { WagmiConfig, createConfig } from "wagmi";
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';
import { goerli } from "wagmi/chains";
import NavBar from '../components/NavBar';

const chains = [goerli]

function MyApp({ Component, pageProps }: AppProps) {

  const walletConnectProjectId = process.env.WALLETCONNECT_PROJECT_ID || '';

  const config = createConfig(
    getDefaultConfig({
      alchemyId: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
      walletConnectProjectId: walletConnectProjectId,

      appName: "Aqueduct",
      chains
    }),
  );

  const client = new ApolloClient({
    uri: 'https://api.studio.thegraph.com/query/49133/aqueduct/version/latest',
    cache: new InMemoryCache(),
  });


  return (
    <div className='flex flex-col min-h-screen bg-black text-white overflow-x-hidden'>
      <ApolloProvider client={client}>
        <WagmiConfig config={config}>
          <ConnectKitProvider>
            <div className='w-full flex items-center justify-center'>
              <NavBar />
            </div>
            <div className='flex flex-grow items-center justify-center'>
              <Component {...pageProps} />
            </div>
          </ConnectKitProvider>
        </WagmiConfig>
      </ApolloProvider>
    </div>
  )
}

export default MyApp
