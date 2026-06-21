import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, EmptyState, ErrorState, Input, Spinner } from '@/design-system';
import { getStates, type StateRef } from '@/services/catalog';
import { formatMoney } from '@/services/money';
import { todayIsoDate } from '@/services/datetime';
import {
  checkout,
  getCart,
  removeCartItem,
  updateCartItem,
  type Cart,
  type CartItem,
  type CheckoutInput,
} from '@/services/orders';
import styles from './CheckoutPage.module.css';

// The buyer checkout, reached from the cart. It reviews the cart grouped by farmer with the line
// totals and order total exactly as the API returns them (no money math here), captures the delivery
// contact, address, and expected date, and places the order. Placement sends an Idempotency-Key that
// is generated once for this checkout and reused on every retry, so a double click cannot create two
// orders. The API owns every rule: empty cart, a contact-for-price item, and insufficient stock all
// come back as clear rejections shown to the buyer. Loading, empty, and error states are handled.

type Status = 'loading' | 'ok' | 'error';

interface FarmerGroup {
  farmerId: string;
  farmerName: string;
  items: CartItem[];
}

// Group cart lines by their seller so the buyer sees the multi-farmer split before checkout, the same
// way the order confirmation splits into a sub-order per farmer.
function groupByFarmer(items: CartItem[]): FarmerGroup[] {
  const groups = new Map<string, FarmerGroup>();
  for (const item of items) {
    const farmerId = item.seller?.id ?? 'unknown';
    const farmerName = item.seller?.name ?? 'Farmer';
    const existing = groups.get(farmerId);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(farmerId, { farmerId, farmerName, items: [item] });
    }
  }
  return [...groups.values()];
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [reloadTick, setReloadTick] = useState(0);
  const [states, setStates] = useState<StateRef[]>([]);

  // Delivery details captured for the order.
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [expectedDate, setExpectedDate] = useState('');

  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  // The idempotency key for this checkout. Generated once and reused for every place-order attempt on
  // this page, so retries and double clicks resolve to the same single order.
  const idempotencyKey = useRef<string>(crypto.randomUUID());

  useEffect(() => {
    let active = true;
    void getStates().then((r) => {
      if (active && r.ok) setStates(r.data);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    void getCart().then((r) => {
      if (!active) return;
      if (r.ok) {
        setCart(r.data);
        setStatus('ok');
      } else {
        setStatus('error');
      }
    });
    return () => {
      active = false;
    };
  }, [reloadTick]);

  const items = useMemo(() => cart?.items ?? [], [cart]);
  const groups = useMemo(() => groupByFarmer(items), [items]);
  const currency = cart?.currency;
  const hasInvalidItems = cart?.hasInvalidItems === true;

  const deliveryComplete =
    contactName.trim() !== '' &&
    contactPhone.trim() !== '' &&
    addressLine.trim() !== '' &&
    city.trim() !== '' &&
    stateName.trim() !== '' &&
    expectedDate !== '';

  const canPlace = items.length > 0 && !hasInvalidItems && deliveryComplete && !placing;

  async function changeQuantity(item: CartItem, quantity: number) {
    const productId = item.productId;
    if (!productId || quantity < 1 || mutatingId) return;
    setMutatingId(productId);
    const result = await updateCartItem(productId, quantity);
    setMutatingId(null);
    if (result.ok) {
      setCart(result.data);
      setPlaceError(null);
    }
  }

  async function remove(item: CartItem) {
    const productId = item.productId;
    if (!productId || mutatingId) return;
    setMutatingId(productId);
    const result = await removeCartItem(productId);
    setMutatingId(null);
    if (result.ok) {
      setCart(result.data);
      setPlaceError(null);
    }
  }

  async function handlePlaceOrder(event: FormEvent) {
    event.preventDefault();
    if (!canPlace) return;

    setPlacing(true);
    setPlaceError(null);

    const input: CheckoutInput = {
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      addressLine: addressLine.trim(),
      city: city.trim(),
      state: stateName.trim(),
      expectedDate,
    };

    const outcome = await checkout(idempotencyKey.current, input);
    if (outcome.ok) {
      // Land on the order detail, which shows the per-farmer split. The banner there confirms the
      // order was just placed.
      navigate(`/orders/${outcome.order.orderId}`, { replace: true, state: { placed: true } });
      return;
    }

    setPlacing(false);
    setPlaceError(outcome.error.message);

    // A stock or availability rejection means the cart no longer matches the catalog; refresh it so
    // the buyer sees the current state and can adjust.
    const refreshCodes = [
      'orders.insufficient_stock',
      'cart.out_of_stock',
      'orders.cart_has_invalid_items',
    ];
    if (outcome.code && refreshCodes.includes(outcome.code)) {
      setReloadTick((t) => t + 1);
    }
  }

  if (status === 'loading') {
    return (
      <div className={styles.page}>
        <h1 className={styles.heading}>Checkout</h1>
        <div className={styles.loading} role="status" aria-live="polite">
          <Spinner size={28} label="Loading your cart" />
          <span>Loading your cart…</span>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={styles.page}>
        <h1 className={styles.heading}>Checkout</h1>
        <ErrorState
          title="We could not load your cart"
          description="Please try again in a moment."
          action={
            <Button variant="secondary" onClick={() => setReloadTick((t) => t + 1)}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <h1 className={styles.heading}>Checkout</h1>
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Add crops or livestock to your cart, then come back to check out."
          action={<Button onClick={() => navigate('/browse')}>Browse the marketplace</Button>}
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/browse">Browse</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Checkout</span>
      </nav>
      <h1 className={styles.heading}>Checkout</h1>

      <div className={styles.layout}>
        <div className={styles.review}>
          {hasInvalidItems && (
            <p className={styles.invalidNotice} role="alert">
              Some items below are no longer available. Remove them to continue.
            </p>
          )}

          {groups.map((group) => (
            <Card key={group.farmerId} title={group.farmerName}>
              <ul className={styles.lines}>
                {group.items.map((item) => {
                  const quantity = item.quantity ?? 0;
                  return (
                    <li key={item.productId} className={styles.line}>
                      <div className={styles.lineMain}>
                        <span className={styles.lineTitle}>{item.title ?? 'Item'}</span>
                        <span className={styles.lineMeta}>
                          {item.unitPrice != null
                            ? `${formatMoney({ amount: item.unitPrice, currency })}${
                                item.unitLabel ? ` · ${item.unitLabel}` : ''
                              }`
                            : 'Contact for price'}
                        </span>
                        {!item.isValid && item.issue && (
                          <span className={styles.lineIssue}>{item.issue}</span>
                        )}
                      </div>

                      <div className={styles.lineControls}>
                        <div className={styles.stepper}>
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${item.title ?? 'item'}`}
                            onClick={() => changeQuantity(item, quantity - 1)}
                            disabled={quantity <= 1 || mutatingId === item.productId}
                          >
                            −
                          </button>
                          <span className={styles.quantity} aria-label="Quantity">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${item.title ?? 'item'}`}
                            onClick={() => changeQuantity(item, quantity + 1)}
                            disabled={mutatingId === item.productId}
                          >
                            +
                          </button>
                        </div>
                        <span className={styles.lineTotal}>
                          {item.lineTotal != null
                            ? formatMoney({ amount: item.lineTotal, currency })
                            : '-'}
                        </span>
                        <button
                          type="button"
                          className={styles.remove}
                          onClick={() => remove(item)}
                          disabled={mutatingId === item.productId}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          ))}

          <Card title="Delivery details">
            <form className={styles.form} id="checkout-form" onSubmit={handlePlaceOrder} noValidate>
              <Input
                label="Contact name"
                autoComplete="name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
              <Input
                label="Contact phone"
                type="tel"
                autoComplete="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
              <Input
                label="Delivery address"
                autoComplete="street-address"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
              />
              <div className={styles.formRow}>
                <Input
                  label="City or town"
                  autoComplete="address-level2"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <label className={styles.selectField}>
                  <span className={styles.selectLabel}>State</span>
                  <select
                    className={styles.select}
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                  >
                    <option value="">Select a state</option>
                    {states.map((s) => (
                      <option key={s.code ?? s.name ?? ''} value={s.name ?? ''}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <Input
                label="Expected delivery date"
                type="date"
                min={todayIsoDate()}
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
              />
            </form>
          </Card>
        </div>

        <aside className={styles.summary}>
          <Card title="Order summary">
            <dl className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <dt>Items</dt>
                <dd>{cart?.itemCount ?? items.length}</dd>
              </div>
              <div className={[styles.summaryRow, styles.summaryTotal].join(' ')}>
                <dt>Order total</dt>
                <dd>{formatMoney({ amount: cart?.total ?? 0, currency })}</dd>
              </div>
            </dl>

            {placeError && (
              <p className={styles.placeError} role="alert">
                {placeError}
              </p>
            )}

            <Button
              type="submit"
              form="checkout-form"
              fullWidth
              disabled={!canPlace}
              loading={placing}
              loadingLabel="Placing your order"
            >
              {placing ? 'Placing your order' : 'Place order'}
            </Button>
            <p className={styles.summaryNote}>
              You pay each farmer through the platform. Your order is split into a delivery per
              farmer.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
