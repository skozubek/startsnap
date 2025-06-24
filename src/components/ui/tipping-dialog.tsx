/**
 * src/components/ui/tipping-dialog.tsx
 * @description Reusable tipping dialog component for sending Algorand tips (ALGO and USDC) to creators with neobrutalist styling
 */

import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Textarea } from './textarea';
import { WalletConnect } from './WalletConnect';
import { useWallet } from '@txnlab/use-wallet-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import algosdk from 'algosdk';
import { getAlgoClient } from '@algorandfoundation/algokit-utils';

// USDC on Algorand MainNet Asset ID
const USDC_ASSET_ID = 31566704;

// Currency configuration
const CURRENCIES = {
  ALGO: {
    name: 'ALGO',
    symbol: 'ALGO',
    decimals: 6, // Algorand uses microAlgos (1 ALGO = 1,000,000 microAlgos)
    minAmount: 0.1,
    isNative: true
  },
  USDC: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6, // USDC has 6 decimal places (1 USDC = 1,000,000 microUSDC)
    minAmount: 0.01,
    isNative: false,
    assetId: USDC_ASSET_ID
  }
} as const;

// Predefined tip amounts
const PREDEFINED_AMOUNTS = [5, 10, 15] as const;

type CurrencyType = keyof typeof CURRENCIES;
type TipAmountType = typeof PREDEFINED_AMOUNTS[number] | 'custom';

interface WalletBalance {
  algo: number;
  usdc: number;
  hasUsdc: boolean;
}

interface TippingDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Function to close the dialog */
  onClose: () => void;
  /** Creator's Algorand wallet address */
  creatorAddress: string;
  /** Name of the project being tipped for */
  projectName: string;
}

/**
 * @description Tipping dialog for sending Algorand tips (ALGO and USDC) to creators with neobrutalist styling
 * @param {TippingDialogProps} props - Component props
 * @returns {JSX.Element | null} Tipping dialog or null if not open
 */
export const TippingDialog: React.FC<TippingDialogProps> = ({
  isOpen,
  onClose,
  creatorAddress,
  projectName
}) => {
  const { activeAccount, activeAddress, signTransactions, algodClient } = useWallet();
  const { user } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState<TipAmountType>(5);
  const [customAmount, setCustomAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>('ALGO');
  const [walletBalance, setWalletBalance] = useState<WalletBalance>({ algo: 0, usdc: 0, hasUsdc: false });
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Fetch wallet balances when wallet connects or dialog opens
  useEffect(() => {
    if (isOpen && activeAddress) {
      fetchWalletBalance();
    }
  }, [isOpen, activeAddress]);

  if (!isOpen) return null;

  /**
   * @description Fetches the user's ALGO and USDC balances
   * @async
   * @sideEffects Updates walletBalance state
   */
  const fetchWalletBalance = async () => {
    if (!activeAddress) return;

    setIsLoadingBalance(true);
    try {
      // Initialize Algorand client
      const client = algodClient || getAlgoClient({
        server: 'https://mainnet-api.algonode.cloud',
        port: '',
        token: ''
      });

      const accountInfo = await client.accountInformation(activeAddress).do();

      // Get ALGO balance (convert microAlgos to ALGO)
      const algoBalance = Number(accountInfo.amount) / 1_000_000;

      // Get USDC balance if opted in
      const usdcAsset = accountInfo.assets?.find((asset: any) => asset['asset-id'] === USDC_ASSET_ID);
      const usdcBalance = usdcAsset ? Number(usdcAsset.amount) / 1_000_000 : 0;
      const hasUsdc = !!usdcAsset;

      setWalletBalance({
        algo: algoBalance,
        usdc: usdcBalance,
        hasUsdc
      });

      // Auto-select currency based on what user has
      if (!hasUsdc && selectedCurrency === 'USDC') {
        setSelectedCurrency('ALGO');
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      toast.error('Unable to fetch wallet balance');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  /**
   * @description Handles backdrop click to close dialog
   * @param {React.MouseEvent} e - Mouse event
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  /**
   * @description Handles escape key press to close dialog
   * @param {React.KeyboardEvent} e - Keyboard event
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  /**
   * @description Clears the dialog state and closes it
   */
  const handleClose = () => {
    setSelectedAmount(5);
    setCustomAmount('');
    setNote('');
    setIsSending(false);
    setSelectedCurrency('ALGO');
    setWalletBalance({ algo: 0, usdc: 0, hasUsdc: false });
    onClose();
  };

  /**
   * @description Gets the current tip amount based on selection
   * @returns {number} The tip amount
   */
  const getCurrentTipAmount = (): number => {
    if (selectedAmount === 'custom') {
      return parseFloat(customAmount) || 0;
    }
    return selectedAmount;
  };

  /**
   * @description Validates the current tip amount for the selected currency
   * @returns {boolean} Whether the amount is valid
   */
  const validateAmount = (): boolean => {
    const amount = getCurrentTipAmount();
    const currency = CURRENCIES[selectedCurrency];
    const availableBalance = selectedCurrency === 'ALGO' ? walletBalance.algo : walletBalance.usdc;

    return !isNaN(amount) &&
           amount >= currency.minAmount &&
           amount <= availableBalance;
  };

  /**
   * @description Checks if a currency option should be enabled
   * @param {CurrencyType} currency - Currency to check
   * @returns {boolean} Whether the currency is available
   */
  const isCurrencyAvailable = (currency: CurrencyType): boolean => {
    if (currency === 'ALGO') {
      return walletBalance.algo >= CURRENCIES.ALGO.minAmount;
    } else {
      return walletBalance.hasUsdc && walletBalance.usdc >= CURRENCIES.USDC.minAmount;
    }
  };

  /**
   * @description Gets the balance for a specific currency
   * @param {CurrencyType} currency - Currency to get balance for
   * @returns {number} The balance amount
   */
  const getCurrencyBalance = (currency: CurrencyType): number => {
    return currency === 'ALGO' ? walletBalance.algo : walletBalance.usdc;
  };

  /**
   * @description Checks if a predefined amount is affordable
   * @param {number} amount - Amount to check
   * @returns {boolean} Whether the amount is affordable
   */
  const isAmountAffordable = (amount: number): boolean => {
    const availableBalance = getCurrencyBalance(selectedCurrency);
    return amount <= availableBalance;
  };

  /**
   * @description Handles sending the tip transaction (ALGO or USDC)
   * @async
   * @sideEffects Sends Algorand transaction and shows toast notifications
   */
  const handleSendTip = async () => {
    if (!activeAddress || !activeAccount) {
      toast.error('Wallet not connected');
      return;
    }

    if (!validateAmount()) {
      const currency = CURRENCIES[selectedCurrency];
      const availableBalance = getCurrencyBalance(selectedCurrency);
      const currentAmount = getCurrentTipAmount();
      toast.error(`Invalid tip amount`, {
        description: `Enter between ${currency.minAmount} and ${availableBalance.toFixed(6)} ${currency.symbol}`
      });
      return;
    }

    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setIsSending(true);

    try {
      // 1. Initialize Algorand client for MainNet
      const client = algodClient || getAlgoClient({
        server: 'https://mainnet-api.algonode.cloud',
        port: '',
        token: ''
      });

      // 2. Get suggested transaction parameters
      const suggestedParams = await client.getTransactionParams().do();

      // 3. Create transaction note with project context
      const currency = CURRENCIES[selectedCurrency];
      const tipAmount = getCurrentTipAmount();
      const transactionNote = new Uint8Array(
        Buffer.from(`${currency.symbol} tip for ${projectName}${note ? `: ${note}` : ''}`)
      );

      let transaction;

      if (selectedCurrency === 'ALGO') {
        // 4a. ALGO Payment Transaction
        const amountInMicroAlgos = Math.round(tipAmount * 1_000_000);

        transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          sender: activeAddress,
          receiver: creatorAddress,
          amount: amountInMicroAlgos,
          note: transactionNote,
          suggestedParams
        });
      } else {
        // 4b. USDC Asset Transfer Transaction
        const amountInMicroUSDC = Math.round(tipAmount * 1_000_000);

        transaction = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          sender: activeAddress,
          receiver: creatorAddress,
          amount: amountInMicroUSDC,
          assetIndex: USDC_ASSET_ID,
          note: transactionNote,
          suggestedParams
        });
      }

      // 5. Sign transaction using wallet (Pera Wallet will handle the UI)
      const signedTxns = await signTransactions([transaction]);

      // 6. Send signed transaction to network
      const signedTxn = signedTxns[0];
      if (!signedTxn) {
        throw new Error('Transaction signing failed');
      }

      const response = await algodClient.sendRawTransaction(signedTxn).do();
      const txId = response.txid;

      // 7. Wait for transaction confirmation
      const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

      if (confirmedTxn.confirmedRound) {
        toast.success('Tip sent successfully!', {
          description: `Sent ${tipAmount} ${currency.symbol} to ${projectName} creator`
        });

        // 8. Log activity to database
        await logTipActivity(txId, tipAmount);

        // 9. Refresh balance after successful transaction
        await fetchWalletBalance();

        handleClose();
      } else {
        throw new Error('Transaction was not confirmed');
      }

    } catch (error: any) {
      console.error('Error sending tip:', error);

      // Handle specific error cases with user-friendly messages
      let errorMessage = 'Transaction failed';
      let errorDescription = '';

      if (error?.message?.includes('cancelled') || error?.message?.includes('rejected')) {
        errorMessage = 'Transaction cancelled';
        errorDescription = 'You cancelled the transaction in your wallet.';
      } else if (error?.message?.includes('overspend') || error?.message?.includes('insufficient')) {
        const currency = CURRENCIES[selectedCurrency];
        errorMessage = `Insufficient ${currency.symbol} balance`;
        errorDescription = `Please add more ${currency.symbol} to your wallet and try again.`;
      } else if (error?.message?.includes('TransactionPool.Remember') && error?.message?.includes('overspend')) {
        const currency = CURRENCIES[selectedCurrency];
        errorMessage = `Insufficient ${currency.symbol} balance`;
        errorDescription = `Your wallet doesn't have enough ${currency.symbol} for this transaction.`;
      } else if (error?.message?.includes('asset') && error?.message?.includes('missing')) {
        errorMessage = 'USDC not available in wallet';
        errorDescription = 'Add USDC to your wallet first. You can get USDC from exchanges or swap ALGO for USDC on Algorand DEXs.';
      } else if (error?.message?.includes('asset not opted in')) {
        errorMessage = 'Recipient cannot receive USDC';
        errorDescription = 'The project creator needs to add USDC to their wallet first.';
      } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        errorMessage = 'Network error';
        errorDescription = 'Please check your internet connection and try again.';
      } else if (error?.message?.includes('timeout')) {
        errorMessage = 'Transaction timeout';
        errorDescription = 'The transaction took too long. Please try again.';
      } else if (error?.message) {
        errorMessage = 'Transaction failed';
        errorDescription = 'Please try again or contact support if the issue persists.';
      }

      toast.error(errorMessage, {
        description: errorDescription
      });
    } finally {
      setIsSending(false);
    }
  };

  /**
   * @description Logs the tip activity to the database
   * @async
   * @param {string} txId - Transaction ID from Algorand
   * @param {number} tipAmount - Amount of the tip
   * @sideEffects Creates activity log entry in database
   */
  const logTipActivity = async (txId: string, tipAmount: number) => {
    if (!user) return;

    try {
      // Find the project ID and creator info for the activity log
      const { data: projectData, error: projectError } = await supabase
        .from('startsnaps')
        .select('id, user_id')
        .eq('name', projectName)
        .single();

      if (projectError || !projectData) {
        console.warn('Could not find project for activity log:', projectError);
        return;
      }

      const currency = CURRENCIES[selectedCurrency];

      // Call the database function to create activity log entry
      const { error: activityError } = await supabase.rpc('create_activity_log', {
        p_activity_type: 'tip_sent',
        p_actor_user_id: user.id,
        p_target_startsnap_id: projectData.id,
        p_target_user_id: projectData.user_id,
        p_metadata: {
          tip_amount: tipAmount.toString(),
          currency: currency.symbol,
          transaction_id: txId,
          note: note || null
        },
        p_visibility: 'public'
      });

      if (activityError) {
        console.error('Error logging tip activity:', activityError);
      }
    } catch (error) {
      console.error('Error in logTipActivity:', error);
    }
  };

  const isWalletConnected = !!(activeAccount && activeAddress);
  const canSendTip = isWalletConnected && validateAmount() && !isSending && !isLoadingBalance;
  const currency = CURRENCIES[selectedCurrency];
  const currentTipAmount = getCurrentTipAmount();

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isSending ? 'bg-transparent' : 'bg-black/30'
      }`}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className="bg-startsnap-white border-2 border-gray-800 rounded-xl shadow-[3px_3px_0px_#1f2937] md:border-4 md:shadow-[6px_6px_0px_#1f2937] max-w-md p-6 sm:p-8 w-full animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tipping-title"
        aria-describedby="tipping-description"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="material-icons text-startsnap-mountain-meadow text-2xl">
              monetization_on
            </span>
            <h2
              id="tipping-title"
              className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-xl leading-7"
            >
              Send Tip
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 p-0 hover:bg-startsnap-mischka/20"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Description */}
        <p
          id="tipping-description"
          className="font-['Roboto',Helvetica] text-startsnap-river-bed text-base leading-6 mb-6"
        >
          Support the creator of <strong>{projectName}</strong>
        </p>

        {/* Wallet Connection Section */}
        {!isWalletConnected ? (
          <div className="mb-6">
            <WalletConnect
              compact={true}
              buttonText="Connect Wallet to Send Tip"
              mode="payment"
              onWalletConnected={(address: string) => {
                toast.success('Wallet connected! You can now send a tip.');
              }}
            />
          </div>
        ) : (
          <div className="mb-6">
            {/* Wallet Status with Balance */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-icons text-green-600">check_circle</span>
                  <div>
                    <p className="text-sm font-medium text-green-800">Wallet Connected</p>
                    <p className="font-mono text-xs text-green-700">
                      {activeAddress.slice(0, 8)}...{activeAddress.slice(-8)}
                    </p>
                  </div>
                </div>
                {isLoadingBalance ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <span className="material-icons text-sm animate-spin">refresh</span>
                  </div>
                ) : (
                  <div className="text-right">
                    <div className="text-xs text-green-700">
                      <div>ALGO: {walletBalance.algo.toFixed(4)}</div>
                      <div>USDC: {walletBalance.hasUsdc ? walletBalance.usdc.toFixed(4) : 'N/A'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tip Form - Only show when wallet is connected */}
        {isWalletConnected && (
          <div className="space-y-6 mb-6">
            {/* Currency Selection */}
            <div className="space-y-2">
              <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-base leading-6">
                Currency
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(CURRENCIES).map(([key, curr]) => {
                  const isAvailable = isCurrencyAvailable(key as CurrencyType);
                  const balance = getCurrencyBalance(key as CurrencyType);

                  return (
                    <button
                      key={key}
                      onClick={() => isAvailable && setSelectedCurrency(key as CurrencyType)}
                      disabled={!isAvailable}
                      className={`p-3 border-2 border-solid rounded-lg font-['Space_Grotesk',Helvetica] font-medium transition-all duration-150 ${
                        selectedCurrency === key && isAvailable
                          ? 'border-startsnap-mountain-meadow bg-startsnap-mountain-meadow/10 text-startsnap-mountain-meadow'
                          : isAvailable
                          ? 'border-gray-800 bg-white text-startsnap-oxford-blue hover:border-startsnap-mountain-meadow/50'
                          : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span>{curr.symbol}</span>
                        <span className="text-xs font-mono">
                          {isAvailable ? balance.toFixed(4) : 'N/A'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedCurrency === 'USDC' && !walletBalance.hasUsdc && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="material-icons text-blue-600 text-sm mr-1 align-middle">info</span>
                    USDC must be added to your wallet first. Get USDC from exchanges like Coinbase or swap ALGO for USDC on Algorand DEXs.
                  </p>
                </div>
              )}
            </div>

            {/* Tip Amount Selection */}
            <div className="space-y-2">
              <label className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-base leading-6">
                Tip Amount ({currency.symbol})
              </label>

              {/* Predefined Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {PREDEFINED_AMOUNTS.map((amount) => {
                  const isAffordable = isAmountAffordable(amount);
                  return (
                    <button
                      key={amount}
                      onClick={() => isAffordable && setSelectedAmount(amount)}
                      disabled={!isAffordable}
                      className={`p-3 border-2 border-solid rounded-lg font-['Space_Grotesk',Helvetica] font-medium transition-all duration-150 ${
                        selectedAmount === amount && isAffordable
                          ? 'border-startsnap-mountain-meadow bg-startsnap-mountain-meadow/10 text-startsnap-mountain-meadow'
                          : isAffordable
                          ? 'border-gray-800 bg-white text-startsnap-oxford-blue hover:border-startsnap-mountain-meadow/50'
                          : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {amount}
                    </button>
                  );
                })}
                <button
                  onClick={() => setSelectedAmount('custom')}
                  className={`p-3 border-2 border-solid rounded-lg font-['Space_Grotesk',Helvetica] font-medium transition-all duration-150 ${
                    selectedAmount === 'custom'
                      ? 'border-startsnap-mountain-meadow bg-startsnap-mountain-meadow/10 text-startsnap-mountain-meadow'
                      : 'border-gray-800 bg-white text-startsnap-oxford-blue hover:border-startsnap-mountain-meadow/50'
                  }`}
                >
                  Custom
                </button>
              </div>

              {/* Custom Amount Input - Only show when custom is selected */}
              {selectedAmount === 'custom' && (
                <div className="mt-6 p-4 bg-gray-50/50 border border-gray-200 rounded-lg">
                  <div className="space-y-3">
                    <Input
                      type="number"
                      step={currency.minAmount}
                      min={currency.minAmount}
                      max={getCurrencyBalance(selectedCurrency)}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder={`Enter amount (min ${currency.minAmount})`}
                      className="border-2 border-solid border-gray-800 rounded-lg p-4 font-['Roboto',Helvetica] text-startsnap-pale-sky text-lg"
                    />
                    <div className="flex justify-between text-xs text-gray-600 px-1">
                      <span>Minimum: {currency.minAmount} {currency.symbol}</span>
                      <span>Available: {getCurrencyBalance(selectedCurrency).toFixed(6)} {currency.symbol}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Optional Note */}
            <div className="space-y-2">
              <label
                htmlFor="tip-note"
                className="block font-['Space_Grotesk',Helvetica] font-bold text-startsnap-oxford-blue text-base leading-6"
              >
                Message (Optional)
              </label>
              <Textarea
                id="tip-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Thanks for the awesome project!"
                maxLength={100}
                className="border-2 border-solid border-gray-800 rounded-lg p-3 min-h-[80px] font-['Roboto',Helvetica] text-startsnap-pale-sky resize-none"
              />
              <p className="text-xs text-gray-500">
                {note.length}/100 characters
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        {isWalletConnected && (
          <div className="space-y-3">
            {/* Signing Status Message */}
            {isSending && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="material-icons text-blue-600 animate-pulse">phone_android</span>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Check your mobile device</p>
                    <p className="text-xs text-blue-700">
                      Open Pera Wallet on your phone to sign the transaction
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleSendTip}
              disabled={!canSendTip}
              variant="success"
              size="lg"
              className="w-full"
            >
              {isSending ? 'Waiting for signature...' : isLoadingBalance ? 'Loading...' : `Send ${currentTipAmount || '0'} ${currency.symbol} Tip`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};