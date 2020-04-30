export const UNSAFE_CHAINS = ["Development", "Plasm Testnet v3"];

export default function detectUnsafe(chain: Text | string): boolean {
  return UNSAFE_CHAINS.includes(chain.toString());
}
