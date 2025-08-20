/**
 * @param num - number with decimals
 * @returns the number round to two decimals
 */
export function roundToTwo(num: number): number {
  return Math.round(num * 100) / 100;
}
