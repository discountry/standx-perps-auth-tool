
import { PrepareSignInResponse, LoginResponse, ChainType } from '../types';

const BASE_URL = 'https://api.standx.com';

export class StandXService {
  /**
   * Request signature data from the StandX server
   */
  static async prepareSignIn(chain: ChainType, address: string, requestId: string): Promise<string> {
    const response = await fetch(`${BASE_URL}/v1/offchain/prepare-signin?chain=${chain}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, requestId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Prepare sign-in failed: ${errorText}`);
    }

    const data: PrepareSignInResponse = await response.json();
    if (!data.success) {
      throw new Error('Server returned unsuccessful preparation status');
    }

    return data.signedData;
  }

  /**
   * Final login request with the wallet signature
   */
  static async login(
    chain: ChainType, 
    signature: string, 
    signedData: string, 
    expiresSeconds: number = 604800
  ): Promise<LoginResponse> {
    const response = await fetch(`${BASE_URL}/v1/offchain/login?chain=${chain}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signature, signedData, expiresSeconds }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Login failed: ${errorText}`);
    }

    return await response.json();
  }
}
