import { describe, expect, it } from 'vitest';
import { haversineMiles } from './distance.js';

describe('haversineMiles', () => {
  it('calculates a sensible distance', () => {
    const miles = haversineMiles({ lat: 34.0224, lng: -118.2851 }, { lat: 34.0689, lng: -118.4452 });
    expect(miles).toBeGreaterThan(8);
    expect(miles).toBeLessThan(12);
  });
});

