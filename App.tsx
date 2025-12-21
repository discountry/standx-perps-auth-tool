
import React from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, type AppKitNetwork } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/Header';
import AuthTool from './components/AuthTool';

// 1. Get projectId from user
const projectId = 'd5297a7590289eccc377ea0661d80cb2';

// 2. App metadata
const metadata = {
  name: 'StandX Auth Tool',
  description: 'Export credentials for StandX CLI',
  url: window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

// 3. Define networks (BSC is required by StandX Perps)
const bsc: AppKitNetwork = {
  id: 56,
  name: 'BNB Smart Chain',
  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  rpcUrls: { default: { http: ['https://bsc-dataseed.binance.org'] } },
  blockExplorers: { default: { name: 'BscScan', url: 'https://bscscan.com' } }
};

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [bsc, mainnet];

// 4. Create the Wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
});

// 5. Initialize AppKit (keep outside components to avoid rerenders)
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  metadata,
  projectId,
  themeMode: 'dark',
  // Privacy: analytics are enabled by default in AppKit; keep disabled here.
  features: {
    analytics: false
  }
});

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-blue-500/30">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <AuthTool />
            </div>
          </main>
          <footer className="mt-auto py-8 text-center text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} StandX Perps Developer Tools</p>
          </footer>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
