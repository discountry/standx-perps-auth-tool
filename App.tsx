
import React from 'react';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { WagmiProvider } from 'wagmi';
import { bsc, mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/Header';
import AuthTool from './components/AuthTool';

// 1. Get projectId from user
const projectId = 'd5297a7590289eccc377ea0661d80cb2';

// 2. Create wagmiConfig
const metadata = {
  name: 'StandX Auth Tool',
  description: 'Export credentials for StandX CLI',
  url: window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const chains = [bsc, mainnet] as const;
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

// 3. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  themeMode: 'dark',
});

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <WagmiProvider config={config}>
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
