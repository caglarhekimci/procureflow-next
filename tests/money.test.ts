import { it, expect } from 'vitest';
import { toMinorUnits } from '@/shared/format';
it('parses decimal amounts without floating point rounding', () => {
  expect(toMinorUnits('1234.56')).toBe(123456);
  expect(toMinorUnits('0.29')).toBe(29);
  expect(toMinorUnits('100')).toBe(10000);
});
it.each(['-1', '1.234', '1e4', '', 'NaN', '10,50'])('rejects ambiguous or invalid amount %s', (v) =>
  expect(() => toMinorUnits(v)).toThrow(),
);
