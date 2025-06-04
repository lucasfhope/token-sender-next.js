
export function parseList(input: string): string[] {
  return input
    .split(/[\n,]+/)
    .map(item => item.trim())
    .filter(item => item !== '');
}

/**
 * Returns only the tokens that represent **positive finite numbers**.
 * (Keeps them as **strings** so callers can decide how to format them.)
 */
export function parseNumberList(input: string): string[] {
    return parseList(input)
    .map(token => Number(token))                     
    .filter(n => Number.isFinite(n) && n > 0)     
    .map(n => Math.trunc(n).toString());
}

/**
 * Returns only the tokens that match a 20-byte hex address
 * (e.g. an Ethereum address) in either upper- or lower-case.
 */
const HEX_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

export function parseHexList(input: string): string[] {
  return parseList(input).filter(addr => HEX_ADDRESS_RE.test(addr));
}
