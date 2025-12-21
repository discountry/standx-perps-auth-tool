
import React from 'react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';

const Header: React.FC = () => {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();

  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white italic">S</div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            StandX Auth Tool
          </h1>
        </div>
        
        <button
          onClick={() => open()}
          className={`px-4 py-2 rounded-full font-medium transition-all text-sm border shadow-sm flex items-center gap-2 ${
            isConnected 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
            : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700 shadow-blue-500/20'
          }`}
        >
          {isConnected ? (
            <>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </>
          ) : (
            'Connect Wallet'
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
