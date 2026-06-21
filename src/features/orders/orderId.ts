// A short, readable handle for an order or sub-order id, for display only. The full id is still what
// the API uses; this just trims the uuid to its first block so the screen is not dominated by it.
export function shortOrderId(id: string | null | undefined): string {
  if (!id) {
    return '';
  }
  return `#${id.split('-')[0]}`;
}
