
import React, { useState } from 'react';
import { StandXCredentials } from '../types';

interface ExportCardProps {
  credentials: StandXCredentials;
  onReset: () => void;
}

const ExportCard: React.FC<ExportCardProps> = ({ credentials, onReset }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(credentials, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `standx-creds-${credentials.address.slice(0, 6)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-8 border-b border-slate-800 bg-emerald-500/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Credentials Generated</h2>
              <p className="text-emerald-500/70 text-sm font-medium uppercase tracking-wider">Ready for CLI Use</p>
            </div>
          </div>
          <button 
            onClick={onReset}
            className="text-slate-500 hover:text-white transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem label="Address" value={credentials.address} />
          <InfoItem label="Chain" value={credentials.chain.toUpperCase()} />
          <InfoItem label="User Alias" value={credentials.alias || 'N/A'} />
          <InfoItem label="Request ID" value={credentials.requestId} />
        </div>

        <div className="space-y-6">
          <CredentialBox 
            label="ED25519 Private Key (Local Only)" 
            value={credentials.ed25519PrivateKey} 
            isSecret={true}
            onCopy={() => copyToClipboard(credentials.ed25519PrivateKey, 'priv')}
            isCopied={copiedField === 'priv'}
          />
          <CredentialBox 
            label="Access Token (JWT)" 
            value={credentials.accessToken} 
            onCopy={() => copyToClipboard(credentials.accessToken, 'token')}
            isCopied={copiedField === 'token'}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            onClick={downloadJson}
            className="flex-1 bg-white text-slate-900 py-4 rounded-xl font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download config.json
          </button>
          <button
            onClick={() => copyToClipboard(JSON.stringify(credentials, null, 2), 'all')}
            className="flex-1 bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            {copiedField === 'all' ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Copied JSON!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                Copy JSON
              </>
            )}
          </button>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
          <svg className="w-6 h-6 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <p className="text-amber-500/90 text-sm leading-relaxed">
            <strong>Security Warning:</strong> These credentials grant full access to your StandX account. 
            Never share your ED25519 Private Key or Access Token. Use them only in trusted CLI environments.
          </p>
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div>
    <h5 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</h5>
    <p className="font-mono text-sm break-all text-slate-200">{value}</p>
  </div>
);

const CredentialBox: React.FC<{ 
  label: string, 
  value: string, 
  onCopy: () => void, 
  isCopied: boolean,
  isSecret?: boolean 
}> = ({ label, value, onCopy, isCopied, isSecret }) => {
  const [show, setShow] = useState(!isSecret);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-slate-500 text-xs font-bold uppercase tracking-widest">{label}</h5>
        <div className="flex gap-3">
          {isSecret && (
            <button 
              onClick={() => setShow(!show)} 
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              {show ? 'Hide' : 'Reveal'}
            </button>
          )}
          <button 
            onClick={onCopy}
            className={`text-xs font-medium transition-colors ${isCopied ? 'text-emerald-400' : 'text-blue-400 hover:text-blue-300'}`}
          >
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="relative group">
        <div className={`mono p-4 rounded-xl border border-slate-800 text-sm break-all leading-relaxed ${
          show ? 'bg-slate-800/50 text-slate-300' : 'bg-slate-800/20 text-slate-700 select-none blur-sm'
        }`}>
          {show ? value : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
        </div>
        {!show && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-slate-900/80 px-3 py-1 rounded-full text-xs text-slate-300 backdrop-blur-sm border border-slate-700">Click Reveal to View</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExportCard;
