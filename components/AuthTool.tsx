
import React, { useCallback, useEffect, useState } from 'react';
import { useAccount, useSignMessage, useSwitchChain } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { generateEd25519KeyPair, parseJwt } from '../utils/crypto';
import { StandXService } from '../services/standxService';
import { StandXCredentials, DecodedSignedData } from '../types';
import ExportCard from './ExportCard';

type ErrorLike = {
  message?: unknown;
  code?: unknown;
  name?: unknown;
};

function isErrorLike(err: unknown): err is ErrorLike {
  return typeof err === 'object' && err !== null;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (isErrorLike(err) && typeof err.message === 'string') return err.message;
  try {
    return String(err);
  } catch {
    return 'Unknown error';
  }
}

function isUserRejectedError(err: unknown): boolean {
  if (!isErrorLike(err)) return false;
  const code = typeof err.code === 'number' ? err.code : undefined;
  const name = typeof err.name === 'string' ? err.name : undefined;
  return code === 4001 || name === 'UserRejectedRequestError';
}

const AuthTool: React.FC = () => {
  const { address, isConnected, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { mutateAsync: switchChainAsync } = useSwitchChain();
  const { open } = useAppKit();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<number>(0);
  const [credentials, setCredentials] = useState<StandXCredentials | null>(null);

  const ensureBscChain = useCallback(
    async (context: 'auto' | 'sign') => {
      if (!isConnected || chainId === 56) return;
      try {
        await switchChainAsync({ chainId: 56 });
      } catch (err: unknown) {
        const rejected = isUserRejectedError(err);
        const message = rejected
          ? 'Please approve switching to BSC in your wallet.'
          : 'Failed to switch to BSC. Please switch networks in your wallet.';
        if (context === 'auto') {
          setError(message);
          return;
        }
        throw new Error(message);
      }
    },
    [chainId, isConnected, switchChainAsync]
  );

  useEffect(() => {
    void ensureBscChain('auto');
  }, [ensureBscChain]);

  const startAuthFlow = async () => {
    if (!address) return;
    
    setLoading(true);
    setError(null);
    setStep(1);

    try {
      // Step 1: Generate temporary ED25519 Keypair
      const keys = generateEd25519KeyPair();

      // Step 2: Prepare Sign-In (BSC is default for StandX Perps)
      const chainType = 'bsc';
      setStep(2);
      const signedDataJwt = await StandXService.prepareSignIn(chainType, address, keys.requestId);
      
      // Step 3: Parse SignedData to get message
      const payload = parseJwt<DecodedSignedData>(signedDataJwt);
      setStep(3);

      // Step 4: Sign message with Wallet
      // This will trigger a notification on the user's mobile wallet if connected via WalletConnect
      await ensureBscChain('sign');
      const signature = await signMessageAsync({ message: payload.message });
      setStep(4);

      // Step 5: Final Login
      const loginRes = await StandXService.login(chainType, signature, signedDataJwt);
      
      const creds: StandXCredentials = {
        ed25519PrivateKey: keys.privateKey,
        ed25519PublicKey: keys.publicKey,
        requestId: keys.requestId,
        accessToken: loginRes.token,
        address: loginRes.address,
        alias: loginRes.alias,
        chain: loginRes.chain,
        timestamp: new Date().toISOString()
      };

      setCredentials(creds);
      setStep(5);
    } catch (err: unknown) {
      // Avoid dumping potentially sensitive objects into console.
      console.error('Authentication failed:', getErrorMessage(err));
      // Handle user rejection specifically
      if (isUserRejectedError(err)) {
        setError('Signature request was rejected by your wallet.');
      } else {
        setError(getErrorMessage(err) || 'An error occurred during authentication');
      }
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setCredentials(null);
    setStep(0);
    setError(null);
  };

  if (!isConnected) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-2xl">
        <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20 shadow-inner">
          <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold mb-4">Connect to StandX</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-10 text-lg leading-relaxed">
          Use your mobile wallet to <strong>scan the QR code</strong> via WalletConnect or use a browser extension to begin the export process.
        </p>
        <button
          onClick={() => open()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-900/40 active:scale-95"
        >
          Connect Wallet to Start
        </button>
        <p className="mt-6 text-slate-500 text-sm">
          No camera access required on this site. You scan our code with <strong>your</strong> wallet app.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {!credentials ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800/50">
            <div>
              <h2 className="text-2xl font-bold">Authentication Flow</h2>
              <p className="text-slate-400 text-sm mt-1">Generating credentials for {address.slice(0, 6)}...{address.slice(-4)}</p>
            </div>
            {loading && (
              <div className="flex items-center gap-3 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Processing</span>
              </div>
            )}
          </div>

          <div className="space-y-4 mb-10">
            <StepItem 
              num={1} 
              active={step >= 1} 
              done={step > 1} 
              label="Local Key Generation" 
              desc="ED25519 keypair is generated securely in your browser's memory."
            />
            <StepItem 
              num={2} 
              active={step >= 2} 
              done={step > 2} 
              label="Handshake with Server" 
              desc="Fetching sign-in data for the provided Request ID."
            />
            <StepItem 
              num={3} 
              active={step >= 3} 
              done={step > 3} 
              label="Wallet Signature" 
              desc="Approve the request in your wallet (mobile or extension)."
            />
            <StepItem 
              num={4} 
              active={step >= 4} 
              done={step > 4} 
              label="Issue Access Token" 
              desc="StandX server verifies the signature and issues your JWT."
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-5 rounded-xl mb-8 text-sm flex items-start gap-4 animate-in slide-in-from-top-2">
              <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-bold mb-1">Error encountered</p>
                <p className="opacity-80">{error}</p>
              </div>
            </div>
          )}

          <button
            onClick={startAuthFlow}
            disabled={loading}
            className={`w-full py-5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
              loading 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-900/30 active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Please confirm in wallet...
              </>
            ) : (
              <>
                Generate CLI Credentials
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </div>
      ) : (
        <ExportCard credentials={credentials} onReset={reset} />
      )}
    </div>
  );
};

const StepItem: React.FC<{ num: number, active: boolean, done: boolean, label: string, desc: string }> = ({ 
  num, active, done, label, desc 
}) => (
  <div className={`flex gap-5 p-5 rounded-2xl transition-all border ${
    done ? 'bg-emerald-500/5 border-emerald-500/10' : 
    active ? 'bg-blue-500/10 border-blue-500/30 scale-[1.02] shadow-lg shadow-blue-900/10' : 
    'bg-slate-800/20 border-transparent opacity-40'
  }`}>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold transition-all ${
      done ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' : 
      active ? 'bg-blue-600 text-white ring-4 ring-blue-500/20' : 
      'bg-slate-800 text-slate-500'
    }`}>
      {done ? (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      ) : num}
    </div>
    <div className="flex flex-col justify-center">
      <h4 className={`font-bold text-lg ${active ? 'text-white' : 'text-slate-400'}`}>{label}</h4>
      <p className={`text-sm mt-0.5 ${active ? 'text-slate-400' : 'text-slate-600'}`}>{desc}</p>
    </div>
  </div>
);

export default AuthTool;
