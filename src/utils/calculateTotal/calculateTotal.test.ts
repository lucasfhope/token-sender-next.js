import { describe, it, expect } from 'vitest';
import { calculateTotal } from './calculateTotal';

describe('calculateTotal', () => {
  it('sums comma-separated numbers', () => {
    expect(calculateTotal('1,2,3')).toBe(BigInt(6));
  });

  it('sums newline-separated numbers', () => {
    expect(calculateTotal('4\n5\n6')).toBe(BigInt(15));
  });

  it('handles mixed comma / newline separators', () => {
    expect(calculateTotal('1, 2\n3,4\n5')).toBe(BigInt(15));
  });

  it('ignores extra whitespace and empty items', () => {
    expect(calculateTotal(' 7 ,\n 8,\n , 9 \n')).toBe(BigInt(24));
  });

  it('ignores non-numerics', () => {
    expect(calculateTotal('10,foo,20,bar')).toBe(BigInt(30));
  });

  it('handles decimal numbers', () => {
    expect(calculateTotal('1.5, 2.42, 3.33')).toBe(BigInt(6));
  });

  it('handles characters after a valid number', () => {
    expect(calculateTotal('1three, 2.5apple, 3_9')).toBe(BigInt(6));
  });

  it('ignores negatives', () => {
    expect(calculateTotal('-1.5, 2.5, 3')).toBe(BigInt(5));
  });

  it('returns 0 for an empty string', () => {
    expect(calculateTotal('')).toBe(BigInt(0));
  });

  it('returns 0 when everything is non-numeric', () => {
    expect(calculateTotal('foo,bar,baz')).toBe(BigInt(0));
  });
});
