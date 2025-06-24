ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS algorand_wallet_address TEXT;

COMMENT ON COLUMN public.profiles.algorand_wallet_address IS 'Public Algorand wallet address for receiving project tips.';
