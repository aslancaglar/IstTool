import { describe, it, expect } from 'vitest';
import { matchesPostalCode } from './postalCode';

describe('matchesPostalCode', () => {
  it('matches exact postal codes', () => {
    expect(matchesPostalCode('57000', '57000')).toBe(true);
    expect(matchesPostalCode('57000', '57001')).toBe(false);
  });

  it('trims whitespace on both sides', () => {
    expect(matchesPostalCode(' 57000 ', '57000')).toBe(true);
    expect(matchesPostalCode('57000', ' 57000 ')).toBe(true);
  });

  it('matches trailing wildcard patterns', () => {
    expect(matchesPostalCode('57*', '57190')).toBe(true);
    expect(matchesPostalCode('57*', '57')).toBe(true);
    expect(matchesPostalCode('57*', '58000')).toBe(false);
  });

  it('matches numeric ranges inclusively', () => {
    expect(matchesPostalCode('57190-57199', '57190')).toBe(true);
    expect(matchesPostalCode('57190-57199', '57199')).toBe(true);
    expect(matchesPostalCode('57190-57199', '57195')).toBe(true);
    expect(matchesPostalCode('57190-57199', '57200')).toBe(false);
    expect(matchesPostalCode('57190-57199', '57100')).toBe(false);
  });

  it('returns false for non-numeric input against a range', () => {
    expect(matchesPostalCode('57190-57199', 'abc')).toBe(false);
  });

  // Regression: the old backend matcher only supported a *trailing* '*' and a
  // string-compare range. These cases lock in the unified (richer) semantics so
  // client and server can no longer disagree.
  it('supports wildcards anywhere in the pattern', () => {
    expect(matchesPostalCode('57*0', '57190')).toBe(true);
    expect(matchesPostalCode('57*0', '57191')).toBe(false);
    expect(matchesPostalCode('*7000', '57000')).toBe(true);
  });

  it('uses numeric (not lexicographic) range comparison', () => {
    // Lexicographically "5709" < "571"? The old string compare would mishandle
    // ranges of differing lengths; numeric comparison is correct.
    expect(matchesPostalCode('5700-5800', '5709')).toBe(true);
    expect(matchesPostalCode('5700-5800', '5900')).toBe(false);
  });
});
