import Stripe from "stripe";

/**
 * Pinned API version shipped with this `stripe` npm release
 * (`node_modules/stripe/esm/apiVersion.js`). Bump when upgrading the SDK.
 */
const STRIPE_API_VERSION = "2026-04-22.dahlia";

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;

  return new Stripe(key, {
    // Stripe's generated types expose a narrowed apiVersion literal; pinning is intentional.
    apiVersion: STRIPE_API_VERSION as never,
  });
}
