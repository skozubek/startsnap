/*
  # Add Algorand Wallet Support to Profiles

  1. New Column
    - `algorand_wallet_address` (text, nullable) - Public Algorand wallet address for receiving project tips

  2. Security
    - No additional RLS policies needed - inherits existing profile policies
    - Public wallet addresses are safe to expose as they're meant for receiving tips
*/

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS algorand_wallet_address TEXT;

COMMENT ON COLUMN public.profiles.algorand_wallet_address IS 'Public Algorand wallet address for receiving project tips.';