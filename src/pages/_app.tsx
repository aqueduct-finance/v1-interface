import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { WagmiConfig, createConfig } from "wagmi";
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


  return (
    <div className='flex flex-col min-h-screen bg-black text-white overflow-x-hidden'>
      <WagmiConfig config={config}>
        <ConnectKitProvider>
          <div>
            <NavBar />
          </div>
          <div className='flex flex-grow items-center justify-center'>
            <Component {...pageProps} />
          </div>
        </ConnectKitProvider>
      </WagmiConfig>
    </div>
  )
}

export default MyApp
