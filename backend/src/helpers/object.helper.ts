/**
 * @param obj - common js object
 * @returns true if the object is empty
 */
export function isEmpty(obj: Object): boolean {
  return Object.keys(obj).length === 0;
}
