import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { WagmiConfig, createConfig } from "wagmi";
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';
import { polygonMumbai } from "wagmi/chains";
import NavBar from '../components/NavBar';
import { createPublicClient, http } from 'viem';

const chains = [polygonMumbai]

function MyApp({ Component, pageProps }: AppProps) {

  const walletConnectProjectId = process.env.WALLETCONNECT_PROJECT_ID || '';

  const config = createConfig(
    getDefaultConfig({
      alchemyId: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
      walletConnectProjectId: walletConnectProjectId,
      /*publicClient: createPublicClient({
        chain: polygonMumbai,
        transport: http()
      }),*/
      appName: "Aqueduct",
      chains
    }),
  );

  const client = new ApolloClient({
    uri: 'https://api.studio.thegraph.com/query/49133/aqueductsubgraph/version/latest',
    cache: new InMemoryCache(),
  });

  return (
    <div className='flex flex-col min-h-screen bg-[#0F172D] text-white neuehaas-roman-font'>
      <ApolloProvider client={client}>
        <WagmiConfig config={config}>
          <ConnectKitProvider
            customTheme={{
              "--ck-overlay-backdrop-filter": "blur(10px)",
              "--ck-font-family": `"Neue Haas Grotesk Display Pro Roman", sans-serif`,
              "--ck-connectbutton-font-weight": '600',
              "--ck-connectbutton-background": "#272727"
            }}
          >
            <NavBar />
            <div className='flex flex-grow md:items-center justify-center'>
              <Component {...pageProps} />
            </div>
          </ConnectKitProvider>
        </WagmiConfig>
      </ApolloProvider>
    </div>
  )
}

export default MyApp;
