
export type ChainType = 'bsc' | 'solana';

export interface StandXCredentials {
  ed25519PrivateKey: string;
  ed25519PublicKey: string;
  requestId: string;
  accessToken: string;
  address: string;
  alias: string;
  chain: string;
  timestamp: string;
}

export interface PrepareSignInResponse {
  success: boolean;
  signedData: string;
}

export interface LoginResponse {
  token: string;
  address: string;
  alias: string;
  chain: string;
  perpsAlpha: boolean;
}

export interface DecodedSignedData {
  message: string;
  address: string;
  requestId: string;
  issuedAt: string;
  exp: number;
}
