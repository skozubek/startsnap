/**
 * @file src/components/ui/WalletConnect.tsx
 * @description Unified Algorand wallet connection component using @txnlab/use-wallet-react
 * as single source of truth with Sonner toast notifications for polished UX
 */

import React, { useState, useEffect } from 'react';
import { useWallet, WalletId } from '@txnlab/use-wallet-react';
import { Button } from './button';
import { toast } from 'sonner';

interface WalletConnectProps {
  onWalletConnected?: (address: string) => void;
  compact?: boolean;
}

/**
 * @description Component for connecting/disconnecting Algorand wallets using unified approach
 * @param {WalletConnectProps} props - Component props
 * @param {Function} [props.onWalletConnected] - Optional callback when wallet connects
 * @param {boolean} [props.compact] - Whether to show compact version
 * @returns {JSX.Element} Streamlined wallet connection UI with single source of truth
 */
export const WalletConnect: React.FC<WalletConnectProps> = ({
  onWalletConnected,
  compact = false
}): JSX.Element => {
  const { wallets, activeAccount, activeAddress } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [justConnected, setJustConnected] = useState(false);

  // Detect when wallet connects and trigger callback
  useEffect(() => {
    if (justConnected && activeAccount && activeAddress) {
      console.log('Wallet connection detected via useEffect:', { activeAccount, activeAddress });
      onWalletConnected?.(activeAddress);
      setJustConnected(false);
      setIsConnecting(false);
    }
  }, [activeAccount, activeAddress, justConnected, onWalletConnected]);

  /**
   * @description Handles wallet connection via use-wallet-react
   * @async
   * @sideEffects Connects to Pera wallet, shows toast notifications, triggers callback
   */
  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const peraWallet = wallets.find(w => w.id === WalletId.PERA);

      if (!peraWallet) {
        toast.error('Pera Wallet connector not found');
        setIsConnecting(false);
        return;
      }

      // Check if wallet is already connected
      if (peraWallet.isConnected && peraWallet.accounts && peraWallet.accounts.length > 0) {
        // Just set it as active and trigger callback
        peraWallet.setActive();
        const address = peraWallet.accounts[0].address;
        onWalletConnected?.(address);
        setIsConnecting(false);
        return;
      }

      // Connect to wallet if not already connected
      await peraWallet.connect();
      peraWallet.setActive();

      // Set flag to detect connection via useEffect
      setJustConnected(true);

    } catch (error: any) {
      console.error('Wallet connection error:', error);
      setIsConnecting(false);

      // Handle specific error cases
      if (error?.message?.includes('Session currently connected')) {
        // Wallet is already connected, set flag to detect via useEffect
        setJustConnected(true);
      } else if (error?.message?.includes('closed') || error?.message?.includes('cancelled')) {
        // User cancelled - don't show error toast
        console.log('User cancelled wallet connection');
      } else {
        // Show error for other cases
        toast.error('Connection failed', {
          description: error?.message || 'Unknown error occurred'
        });
      }
    }
  };

  /**
   * @description Handles wallet disconnection
   * @async
   * @sideEffects Disconnects active wallet and shows toast notification
   */
  const handleDisconnect = async () => {
    try {
      const activeWallet = wallets.find(w => w.isActive);
      if (activeWallet) {
        await activeWallet.disconnect();
        toast.success('Wallet disconnected');
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  // Show connection status if wallet is connected
  if (activeAccount && activeAddress) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 border border-gray-200 rounded-lg bg-green-50">
        <div className="text-center">
          <p className="text-sm text-green-600 font-medium">✅ Connected</p>
          <p className="font-mono text-sm bg-white p-2 rounded mt-1 border">
            {activeAddress.slice(0, 8)}...{activeAddress.slice(-8)}
          </p>
        </div>
        <Button
          variant="secondary"
          size="default"
          onClick={handleDisconnect}
          className="w-full"
        >
          Disconnect Wallet
        </Button>
      </div>
    );
  }

  // Show wallet connection interface - just the essential section
  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
          <img
            src="/pera-logo-black.png"
            alt="Pera Wallet"
            className="w-8 h-8 object-contain"
          />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">Pera Wallet</h4>
          <p className="text-sm text-gray-600">Official Algorand Mobile Wallet</p>
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-4">
        Connect your Pera mobile wallet by scanning the QR code that appears.
      </p>

      <Button
        variant="secondary"
        size="default"
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full"
      >
        {isConnecting ? 'Connecting...' : 'Connect Pera Wallet'}
      </Button>

      {isConnecting && (
        <div className="text-xs text-gray-600 mt-3 text-center bg-white p-2 rounded border border-gray-200">
          <p>📱 Open your Pera Wallet app and approve the connection</p>
        </div>
      )}
    </div>
  );
};