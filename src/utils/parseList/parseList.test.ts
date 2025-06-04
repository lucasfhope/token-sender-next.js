import { describe, it, expect } from 'vitest';
import { parseList, parseNumberList, parseHexList } from './parseList';

describe('parseList', () => {
  it('splits on commas and new-lines, trimming whitespace', () => {
    const input = '  apple, banana\ncarrot ,\n  date ';
    expect(parseList(input)).toEqual(['apple', 'banana', 'carrot', 'date']);
  });

  it('drops empty tokens', () => {
    expect(parseList(', ,\n,\n')).toEqual([]);
  });
});

describe('parseNumberList', () => {
  it('keeps only positive finite numbers (as strings) and makes decimals integers', () => {
    const input = '42, -7, 0, 3.14, NaN, foo';
    expect(parseNumberList(input)).toEqual(['42', '3']);
  });

  it('handles mixed separators and extra spaces', () => {
    const input = ' 1 \n 2, 3 \n\n 4 ';
    expect(parseNumberList(input)).toEqual(['1', '2', '3', '4']);
  });
});

describe('parseHexList', () => {
  it('returns only valid 20-byte 0x-prefixed addresses', () => {
    const good = '0x8ba1f109551bd432803012645ac136ddd64dba72';
    const bad  = '0x123';
    const input = `${good},\n${bad}, 0xGHIJKL01234567890123456789012345678901`;
    expect(parseHexList(input)).toEqual([good]);
  });

  it('accepts mixed-case hex', () => {
    const mixed = '0xAAaaBBbbCCccDDddEEeeFFff0011223344556677';
    expect(parseHexList(mixed)).toEqual([mixed]);
  });
});