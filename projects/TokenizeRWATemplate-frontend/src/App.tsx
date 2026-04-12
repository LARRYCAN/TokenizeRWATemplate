import { useMemo } from 'react'
import algosdk from 'algosdk'
import { WalletProvider, WalletId } from '@txnlab/use-wallet-react'
import { WalletManager, type SupportedWallet } from '@txnlab/use-wallet'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { SnackbarProvider } from 'notistack'

// Verified template utility paths
import { getAlgodConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

// Component Imports based on your folder structure
import Home from './Home'
import Dashboard from './views/Dashboard'
import TokenizePage from './TokenizePage'
import Layout from './Layout'

export default function App() {
  const algodConfig = getAlgodConfigFromViteEnvironment()

  const walletManager = useMemo(() => {
    const network = algodConfig.network || 'testnet'
    const web3AuthClientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID
    const web3AuthNetwork = import.meta.env.VITE_WEB3AUTH_NETWORK || 'testnet'

    const wallets: SupportedWallet[] = [
      { id: WalletId.PERA },
      { id: WalletId.DEFLY },
    ]

    if (web3AuthClientId) {
      wallets.push({
        id: WalletId.WEB3AUTH,
        options: {
          clientId: web3AuthClientId,
          web3AuthNetwork,
          uiConfig: {
            appName: 'TokenizeRWA',
            appUrl: typeof window !== 'undefined' ? window.location.origin : undefined,
          },
          usePopup: true,
        },
      })
    }

    return new WalletManager({
      wallets,
      networks: {
        [network]: {
          algod: {
            baseServer: algodConfig.server || 'https://testnet-api.algonode.cloud',
            port: algodConfig.port || '',
            token: (algodConfig.token as string | algosdk.AlgodTokenHeader) || '',
          },
        },
      },
      defaultNetwork: network,
    })
  }, [algodConfig.server, algodConfig.port, algodConfig.token, algodConfig.network])

  return (
    <SnackbarProvider maxSnack={3}>
      <WalletProvider manager={walletManager}>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tokenize" element={<TokenizePage />} />
            </Route>
          </Routes>
        </Router>
      </WalletProvider>
    </SnackbarProvider>
  )
}