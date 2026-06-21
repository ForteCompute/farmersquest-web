import { useCallback, useState } from 'react';
import { useSession } from '@/app/session';
import { addCartItem } from '@/services/orders';
import { useSignInPrompt } from './SignInPrompt';

// Shared behaviour for the storefront "add to cart" controls. Signed out, it opens the sign-in
// prompt (cart actions need an account). Signed in, it adds the item through the API and reports the
// result, so a card or the product page can show a brief confirmation or an error. The cart, its
// totals, and stock rules all live in the API; this only sends the request and reflects the outcome.
export interface AddToCartState {
  add: (productId: string, quantity?: number, reason?: string) => Promise<boolean>;
  adding: boolean;
  added: boolean;
  error: string | null;
}

export function useAddToCart(): AddToCartState {
  const { isAuthenticated } = useSession();
  const { promptSignIn } = useSignInPrompt();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = useCallback(
    async (productId: string, quantity = 1, reason = 'add this to your cart') => {
      if (!isAuthenticated) {
        promptSignIn(reason);
        return false;
      }
      if (!productId) {
        return false;
      }
      setAdding(true);
      setAdded(false);
      setError(null);
      const result = await addCartItem(productId, quantity);
      setAdding(false);
      if (result.ok) {
        setAdded(true);
        return true;
      }
      setError(result.error.message);
      return false;
    },
    [isAuthenticated, promptSignIn],
  );

  return { add, adding, added, error };
}
