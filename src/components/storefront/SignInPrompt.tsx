import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '@/design-system';

// A shared gate for signed-out actions (save to wishlist, add to cart). Wishlist and cart
// persistence land in a later sprint, so for now these controls are present but gated: tapping one
// opens a friendly prompt to sign in or register. The prompt is provided once and used through the
// useSignInPrompt hook so every storefront surface behaves the same.

interface SignInPromptValue {
  /** Open the prompt. Optional reason tailors the message, for example "save to your wishlist". */
  promptSignIn: (reason?: string) => void;
}

const SignInPromptContext = createContext<SignInPromptValue | null>(null);

export function SignInPromptProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string | null>(null);

  const promptSignIn = useCallback((nextReason?: string) => {
    setReason(nextReason ?? null);
    setOpen(true);
  }, []);

  const value = useMemo<SignInPromptValue>(() => ({ promptSignIn }), [promptSignIn]);

  return (
    <SignInPromptContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={open}
        title="Sign in to continue"
        message={
          reason
            ? `Sign in or create an account to ${reason}.`
            : 'Sign in or create an account to save items and check out.'
        }
        confirmLabel="Sign in"
        cancelLabel="Not now"
        onConfirm={() => {
          setOpen(false);
          navigate('/sign-in');
        }}
        onCancel={() => setOpen(false)}
      />
    </SignInPromptContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- provider and hook belong together.
export function useSignInPrompt(): SignInPromptValue {
  const value = useContext(SignInPromptContext);
  if (!value) {
    // A no-op fallback keeps a card usable if rendered outside a provider (for example in isolation
    // tests); real storefront pages always wrap with the provider.
    return { promptSignIn: () => {} };
  }
  return value;
}
