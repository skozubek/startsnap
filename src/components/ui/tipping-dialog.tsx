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
      className="fixed inset-0 z-50 bg-black/50 md:flex md:items-center md:justify-center md:p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className="bg-startsnap-white border-0 md:border-2 border-startsnap-ebony-clay rounded-none md:rounded-xl shadow-none md:shadow-[4px_4px_0px_#1f2937] w-full h-full md:max-w-md md:w-auto md:h-auto md:max-h-[70vh] animate-in fade-in md:zoom-in-95 duration-300 overflow-y-auto pt-16 md:pt-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tipping-title"
        aria-describedby="tipping-description"
      >
        {/* Header Section */}
        <div className="border-b-2 border-startsnap-ebony-clay p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-startsnap-mountain-meadow rounded-lg border-2 border-startsnap-ebony-clay flex items-center justify-center shadow-[2px_2px_0px_#1f2937]">
                <span className="text-startsnap-ebony-clay text-lg font-bold">$</span>
              </div>
              <h2
                id="tipping-title"
                className="font-['Space_Grotesk',Helvetica] font-black text-startsnap-ebony-clay text-lg md:text-xl uppercase tracking-wider"
              >
                SEND TIP
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 bg-startsnap-beige border-2 border-startsnap-ebony-clay rounded-lg hover:bg-startsnap-beige/90 active:scale-95 transition-all duration-150 flex items-center justify-center shadow-[2px_2px_0px_#1f2937] hover:shadow-[3px_3px_0px_#1f2937] hover:translate-x-[-1px] hover:translate-y-[-1px] tap-target"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4 text-startsnap-ebony-clay" />
            </button>
          </div>
          <p className="text-startsnap-ebony-clay/70 mt-2 md:mt-3 font-medium text-sm md:text-sm">
            Support the creator of <strong className="text-startsnap-ebony-clay">{projectName}</strong>
          </p>
        </div>

        {/* Main Content Section */}
        <div className="p-4 md:p-5 flex-1 md:flex-none">
          {/* Wallet Connection Section */}
          {!isWalletConnected ? (
            <div className="mb-6">
              <div className="bg-startsnap-beige border-2 border-startsnap-ebony-clay rounded-lg p-4 mb-4 shadow-[2px_2px_0px_#1f2937]">
                <p className="font-['Space_Grotesk',Helvetica] font-bold text-startsnap-ebony-clay text-sm uppercase tracking-wide mb-3">
                  WALLET REQUIRED
                </p>
                <p className="text-startsnap-ebony-clay/70 text-sm mb-4">
                  Connect your Algorand wallet to send tips
                </p>
              </div>
              <WalletConnect
                compact={true}
                buttonText="CONNECT WALLET"
                mode="payment"
                onWalletConnected={(address: string) => {
                  toast.success('Wallet connected! You can now send a tip.');
                }}
              />
            </div>
          ) : (
            <div className="mb-4">
              {/* Wallet Status */}
              <div className="bg-startsnap-mountain-meadow border-2 border-startsnap-ebony-clay rounded-lg p-3 mb-4 shadow-[3px_3px_0px_#1f2937]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-startsnap-beige border-2 border-startsnap-ebony-clay rounded-md flex items-center justify-center shadow-[1px_1px_0px_#1f2937]">
                      <span className="text-startsnap-mountain-meadow text-xs font-bold">✓</span>
                    </div>
                    <div>
                      <p className="font-['Space_Grotesk',Helvetica] font-black text-startsnap-ebony-clay text-xs uppercase tracking-wide">
                        WALLET CONNECTED
                      </p>
                      <p className="font-mono text-xs text-startsnap-ebony-clay/70">
                        {activeAddress.slice(0, 6)}...{activeAddress.slice(-6)}
                      </p>
                    </div>
                  </div>
                  {isLoadingBalance ? (
                    <div className="w-5 h-5 bg-startsnap-beige border-2 border-startsnap-ebony-clay rounded-md flex items-center justify-center shadow-[1px_1px_0px_#1f2937]">
                      <span className="text-startsnap-ebony-clay text-xs animate-spin">⟳</span>
                    </div>
                  ) : (
                    <div className="text-right">
                      <div className="text-xs text-startsnap-ebony-clay font-mono font-bold">
                        <div>ALGO: {walletBalance.algo.toFixed(3)}</div>
                        <div>USDC: {walletBalance.hasUsdc ? walletBalance.usdc.toFixed(3) : 'N/A'}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tip Form - Only show when wallet is connected */}
          {isWalletConnected && (
            <div className="space-y-3 md:space-y-4">
              {/* Currency Selection */}
              <div>
                <label className="block font-['Space_Grotesk',Helvetica] font-black text-startsnap-ebony-clay text-xs uppercase tracking-wider mb-2">
                  CURRENCY
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
                        className={`p-2.5 border-2 border-startsnap-ebony-clay rounded-lg font-['Space_Grotesk',Helvetica] font-bold transition-all duration-150 shadow-[2px_2px_0px_#1f2937] hover:shadow-[3px_3px_0px_#1f2937] hover:translate-x-[-1px] hover:translate-y-[-1px] active:scale-95 tap-target ${
                          selectedCurrency === key && isAvailable
                            ? 'bg-startsnap-ebony-clay text-startsnap-beige'
                            : isAvailable
                            ? 'bg-startsnap-beige text-startsnap-ebony-clay hover:bg-startsnap-beige/90'
                            : 'bg-startsnap-mischka text-startsnap-river-bed cursor-not-allowed border-startsnap-river-bed shadow-none hover:shadow-none hover:translate-x-0 hover:translate-y-0'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-sm font-black uppercase tracking-wider">{curr.symbol}</div>
                          <div className="text-xs font-mono opacity-75">
                            {isAvailable ? balance.toFixed(3) : 'N/A'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {selectedCurrency === 'USDC' && !walletBalance.hasUsdc && (
                  <div className="mt-4 bg-startsnap-french-rose/10 border-2 border-startsnap-french-rose rounded-lg p-4 shadow-[2px_2px_0px_#ef4444]">
                    <p className="text-startsnap-french-rose text-sm font-bold">
                      ⚠ USDC must be added to your wallet first
                    </p>
                    <p className="text-startsnap-french-rose/80 text-xs mt-1">
                      Get USDC from exchanges or swap ALGO for USDC on Algorand DEXs
                    </p>
                  </div>
                )}
              </div>

              {/* Tip Amount Selection */}
              <div>
                <label className="block font-['Space_Grotesk',Helvetica] font-black text-startsnap-ebony-clay text-xs uppercase tracking-wider mb-2">
                  TIP AMOUNT ({currency.symbol})
                </label>

                {/* Predefined Amount Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                  {PREDEFINED_AMOUNTS.map((amount) => {
                    const isAffordable = isAmountAffordable(amount);
                    return (
                      <button
                        key={amount}
                        onClick={() => isAffordable && setSelectedAmount(amount)}
                        disabled={!isAffordable}
                        className={`p-2.5 border-2 border-startsnap-ebony-clay rounded-lg font-['Space_Grotesk',Helvetica] font-black text-sm transition-all duration-150 shadow-[2px_2px_0px_#1f2937] hover:shadow-[3px_3px_0px_#1f2937] hover:translate-x-[-1px] hover:translate-y-[-1px] active:scale-95 tap-target ${
                          selectedAmount === amount && isAffordable
                            ? 'bg-startsnap-ebony-clay text-startsnap-beige'
                            : isAffordable
                            ? 'bg-startsnap-beige text-startsnap-ebony-clay hover:bg-startsnap-beige/90'
                            : 'bg-startsnap-mischka text-startsnap-river-bed cursor-not-allowed border-startsnap-river-bed shadow-none hover:shadow-none hover:translate-x-0 hover:translate-y-0'
                        }`}
                      >
                        {amount}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setSelectedAmount('custom')}
                    className={`p-2.5 border-2 border-startsnap-ebony-clay rounded-lg font-['Space_Grotesk',Helvetica] font-black text-xs transition-all duration-150 uppercase tracking-wide shadow-[2px_2px_0px_#1f2937] hover:shadow-[3px_3px_0px_#1f2937] hover:translate-x-[-1px] hover:translate-y-[-1px] active:scale-95 tap-target ${
                      selectedAmount === 'custom'
                        ? 'bg-startsnap-ebony-clay text-startsnap-beige'
                        : 'bg-startsnap-beige text-startsnap-ebony-clay hover:bg-startsnap-beige/90'
                    }`}
                  >
                    CUSTOM
                  </button>
                </div>

                {/* Custom Amount Input */}
                {selectedAmount === 'custom' && (
                  <div className="bg-startsnap-beige border-2 border-startsnap-ebony-clay rounded-lg p-2.5 shadow-[2px_2px_0px_#1f2937]">
                    <Input
                      type="number"
                      step={currency.minAmount}
                      min={currency.minAmount}
                      max={getCurrencyBalance(selectedCurrency)}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder={`Enter amount (min ${currency.minAmount})`}
                      className="w-full border-2 border-startsnap-ebony-clay rounded-lg bg-startsnap-white font-mono text-startsnap-ebony-clay placeholder-startsnap-river-bed shadow-[2px_2px_0px_#1f2937] focus:shadow-[3px_3px_0px_#1f2937] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all duration-200 h-9 text-sm"
                    />
                    <div className="flex justify-between text-xs text-startsnap-ebony-clay/70 mt-1.5 font-mono">
                      <span>MIN: {currency.minAmount}</span>
                      <span>MAX: {getCurrencyBalance(selectedCurrency).toFixed(3)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Note */}
              <div>
                <label
                  htmlFor="tip-note"
                  className="block font-['Space_Grotesk',Helvetica] font-black text-startsnap-ebony-clay text-xs uppercase tracking-wider mb-1.5"
                >
                  MESSAGE (OPTIONAL)
                </label>
                <Textarea
                  id="tip-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Thanks for the awesome project!"
                  maxLength={100}
                  className="min-h-[50px] resize-none border-2 border-startsnap-ebony-clay rounded-lg bg-startsnap-white font-medium text-startsnap-ebony-clay placeholder-startsnap-river-bed shadow-[2px_2px_0px_#1f2937] focus:shadow-[3px_3px_0px_#1f2937] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all duration-200 text-sm"
                />
                <p className="text-xs text-startsnap-river-bed mt-1 font-mono">
                  {note.length}/100
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-1">
                {/* Signing Status Message */}
                {isSending && (
                  <div className="bg-startsnap-mountain-meadow border-2 border-startsnap-ebony-clay rounded-lg p-4 shadow-[2px_2px_0px_#1f2937]">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-startsnap-beige border-2 border-startsnap-ebony-clay rounded-md flex items-center justify-center shadow-[1px_1px_0px_#1f2937]">
                        <span className="text-startsnap-mountain-meadow text-sm animate-pulse">📱</span>
                      </div>
                      <div>
                        <p className="font-['Space_Grotesk',Helvetica] font-black text-startsnap-ebony-clay text-sm uppercase tracking-wide">
                          CHECK YOUR DEVICE
                        </p>
                        <p className="text-startsnap-ebony-clay/70 text-xs mt-1">
                          Open Pera Wallet on your phone to sign the transaction
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSendTip}
                  disabled={!canSendTip}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  {isSending
                    ? 'WAITING FOR SIGNATURE...'
                    : isLoadingBalance
                    ? 'LOADING...'
                    : `SEND ${currentTipAmount || '0'} ${currency.symbol} TIP`
                  }
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};