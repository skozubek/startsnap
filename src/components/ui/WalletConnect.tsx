/**
 * @file src/components/ui/WalletConnect.tsx
 * @description Algorand wallet connection with both direct and WalletConnect support
 * Provides connect/disconnect functionality with support for Pera, Defly, Lute wallets + Pera WalletConnect
 */

import React, { useState, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { Button } from './button';

interface WalletConnectProps {
  onWalletConnected?: (address: string) => void;
  compact?: boolean;
}

/**
 * @description Component for connecting/disconnecting Algorand wallets with dual approach
 * @param {WalletConnectProps} props - Component props
 * @param {Function} [props.onWalletConnected] - Optional callback when wallet connects
 * @param {boolean} [props.compact] - Whether to show compact version
 * @returns {JSX.Element} Enhanced wallet connection UI with direct and WalletConnect options
 */
export const WalletConnect: React.FC<WalletConnectProps> = ({ onWalletConnected, compact = false }): JSX.Element => {
  const { wallets, activeAccount, activeAddress } = useWallet();

  // Pera WalletConnect state
  const [peraWCAddress, setPeraWCAddress] = useState<string | null>(null);
  const [peraWallet, setPeraWallet] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);

    /**
   * @description Initialize Pera WalletConnect on component mount
   * @async
   * @sideEffects Creates PeraWalletConnect instance and attempts reconnection
   */
  useEffect(() => {
    const initPeraWallet = async () => {
      try {
        console.log('🚀 Initializing Pera WalletConnect...');
        const { PeraWalletConnect } = await import('@perawallet/connect');

        const peraWalletInstance = new PeraWalletConnect({
          chainId: 416001, // MainNet (was 416002 for TestNet)
          shouldShowSignTxnToast: false,
          compactMode: false // Show full modal
        });

        console.log('✅ Pera WalletConnect instance created');
        setPeraWallet(peraWalletInstance);

        // Try to reconnect to existing session
        try {
          console.log('🔄 Checking for existing Pera session...');
          const accounts = await peraWalletInstance.reconnectSession();

          if (accounts && accounts.length > 0) {
            console.log('♻️ Reconnected to existing session:', accounts[0]);
            setPeraWCAddress(accounts[0]);
            peraWalletInstance.connector?.on('disconnect', handlePeraDisconnect);
          } else {
            console.log('ℹ️ No existing session found');
          }
        } catch (error) {
          console.log('ℹ️ No existing Pera WalletConnect session to reconnect');
        }
      } catch (error) {
        console.error('❌ Failed to initialize Pera Connect:', error);
      }
    };

    initPeraWallet();
  }, []);

    /**
   * @description Handle Pera WalletConnect connection
   * @async
   * @sideEffects Shows QR modal, connects to mobile wallet, updates connection state
   */
  const handlePeraWCConnect = async () => {
    if (!peraWallet) return;

    try {
      setIsConnecting(true);
      console.log('🔄 Starting Pera WalletConnect...');

      const accounts = await peraWallet.connect();
      console.log('📱 Received accounts from Pera:', accounts);

      if (accounts && accounts.length > 0) {
        const connectedAddress = accounts[0];
        setPeraWCAddress(connectedAddress);

        // Set up disconnect listener
        peraWallet.connector?.on('disconnect', handlePeraDisconnect);

                console.log('✅ Successfully connected via Pera WalletConnect:', connectedAddress);

        // Call callback if provided
        onWalletConnected?.(connectedAddress);

        // Optional: Show success message (only if not compact)
        if (!compact) {
          alert(`✅ Connected to Pera Wallet!\n${connectedAddress.slice(0, 8)}...${connectedAddress.slice(-8)}`);
        }
      } else {
        console.warn('⚠️ No accounts received from Pera wallet');
        alert('⚠️ No accounts found in your Pera wallet');
      }
    } catch (error: any) {
      console.error('❌ Pera WalletConnect error:', error);

      // Don't show error for user cancellation
      if (error?.data?.type !== 'CONNECT_MODAL_CLOSED') {
        console.error('Full error details:', {
          message: error.message,
          code: error.code,
          data: error.data,
          stack: error.stack
        });

        // Show user-friendly error
        alert(`❌ Connection failed: ${error.message || 'Unknown error'}`);
      } else {
        console.log('ℹ️ User closed the connection modal');
      }
    } finally {
      setIsConnecting(false);
      console.log('🏁 Pera connection attempt finished');
    }
  };

  /**
   * @description Handle Pera WalletConnect disconnection
   * @async
   * @sideEffects Disconnects wallet and clears connection state
   */
  const handlePeraDisconnect = async () => {
    if (!peraWallet) return;

    try {
      await peraWallet.disconnect();
      setPeraWCAddress(null);
      console.log('Disconnected from Pera WalletConnect');
    } catch (error) {
      console.error('Pera disconnect failed:', error);
    }
  };

  /**
   * @description Handles direct wallet connection (use-wallet)
   * @param {string} walletId - The ID of the wallet to connect
   * @async
   * @sideEffects Connects to the specified wallet and updates global wallet state
   */
  const handleConnect = async (walletId: string) => {
    try {
      const wallet = wallets.find(w => w.id === walletId);
      if (wallet) {
        await wallet.connect();
        wallet.setActive();
        console.log(`Connected to ${wallet.metadata.name}`);

        // Call callback if provided and wallet has accounts
        if (wallet.accounts && wallet.accounts.length > 0) {
          onWalletConnected?.(wallet.accounts[0].address);
        }
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  /**
   * @description Handles direct wallet disconnection (use-wallet)
   * @async
   * @sideEffects Disconnects the active wallet and updates global wallet state
   */
  const handleDisconnect = async () => {
    try {
      const activeWallet = wallets.find(w => w.isActive);
      if (activeWallet) {
        await activeWallet.disconnect();
        console.log('Wallet disconnected');
      }
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  // Show connection status if any wallet is connected
  if (activeAccount && activeAddress) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 border border-gray-200 rounded-lg bg-green-50">
        <div className="text-center">
          <p className="text-sm text-green-600 font-medium">✅ Connected (Direct)</p>
          <p className="font-mono text-sm bg-white p-2 rounded mt-1 border">
            {activeAddress.slice(0, 8)}...{activeAddress.slice(-8)}
          </p>
        </div>
        <Button variant="secondary" onClick={handleDisconnect}>
          Disconnect Wallet
        </Button>
      </div>
    );
  }

  if (peraWCAddress) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 border border-gray-200 rounded-lg bg-blue-50">
        <div className="text-center">
          <p className="text-sm text-blue-600 font-medium">✅ Connected via WalletConnect</p>
          <p className="font-mono text-sm bg-white p-2 rounded mt-1 border">
            {peraWCAddress.slice(0, 8)}...{peraWCAddress.slice(-8)}
          </p>
        </div>
        <Button variant="secondary" onClick={handlePeraDisconnect}>
          Disconnect Pera Wallet
        </Button>
      </div>
    );
  }

    // Show wallet connection options - Pera Wallet only for simplicity
  return (
    <div className={`flex flex-col ${compact ? 'gap-3' : 'gap-4'} ${compact ? 'p-4' : 'p-6'} border border-gray-200 rounded-lg`}>
      {!compact && <h3 className="text-lg font-semibold text-center">📱 Connect Your Pera Wallet</h3>}
      {compact && <h4 className="font-semibold text-gray-800">Connect Your Pera Wallet</h4>}

      {/* Pera WalletConnect - The Only Option */}
      <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📱</span>
          <h4 className="font-semibold text-blue-800">Pera Wallet</h4>
        </div>
        <p className="text-sm text-blue-700 mb-4">
          Connect your Pera mobile wallet by scanning the QR code that appears.
        </p>
        <Button
          variant="primary"
          onClick={handlePeraWCConnect}
          disabled={isConnecting || !peraWallet}
          className="w-full"
        >
          {isConnecting ? (
            "🔄 Connecting... (Check your mobile app)"
          ) : !peraWallet ? (
            "⏳ Loading..."
          ) : (
            "📱 Connect Pera Wallet"
          )}
        </Button>

        {isConnecting && (
          <div className="text-xs text-blue-600 mt-3 text-center">
            <p>📱 Open your Pera Wallet app and approve the connection</p>
          </div>
        )}
      </div>

      {/* Simple Setup Guide */}
      <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded border border-yellow-200">
        <p className="font-medium mb-2">💡 Quick Setup:</p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Download <strong>Pera Wallet</strong> from your app store</li>
          <li>Create or import your Algorand wallet</li>
          <li>Click "Connect Pera Wallet" above</li>
          <li>Scan the QR code with your Pera app</li>
        </ol>
      </div>
    </div>
  );
};