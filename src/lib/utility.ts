import { ArrayMatchFunction } from '$/types/Utility.js';
import { assertBravoClaim } from './errors.js';

export function stringsMatchIgnoringCase(string1: string, string2: string) {
  for (const val of [string1, string2]) {
    assertBravoClaim(typeof val == 'string', 'All inputs must be strings');
  }
  return (
    string1.toLocaleLowerCase().trim() == string2.toLocaleLowerCase().trim()
  );
}

export function stringsMatch(
  string1: string,
  string2: string,
  options?: { ignoreCase?: boolean },
) {
  if (options?.ignoreCase) {
    return stringsMatchIgnoringCase(string1, string2);
  }
  return string1 === string2;
}

/**
 * Async find function, allowing
 * for async match functions. (Synchronous funcs
 * will also work fine.)
 */
export async function find<Item>(
  items: Item[],
  matchFunction: ArrayMatchFunction<Item>,
) {
  let idx = 0;
  for await (const item of items) {
    if (await matchFunction(item, idx, items)) {
      return item;
    }
    idx++;
  }
}

export function findByField<
  Item extends Record<string, any>,
  Field extends keyof Item,
>(
  findIn: Item[],
  byField: Field,
  value: Item[Field],
  options?: { ignoreCase?: boolean },
): Item | undefined {
  assertBravoClaim(findIn, 'Search array does not exist');
  const item = findIn.find((item) => {
    if (
      options?.ignoreCase &&
      typeof item[byField] == 'string' &&
      typeof value == 'string'
    ) {
      return stringsMatchIgnoringCase(item[byField], value);
    }
    return item[byField] == value;
  });
  return item;
}

export function findRequiredByField<
  Item extends Record<string, any>,
  Field extends keyof Item,
>(
  findIn: Item[],
  byField: Field,
  value: Item[Field],
  options?: { ignoreCase?: boolean },
): Item {
  const item = findByField(findIn, byField, value, options);
  assertBravoClaim(item, 'Matching entity not found');
  return item;
}

export function toBase64(string: string) {
  return Buffer.from(string).toString('base64');
}

export function selectRandom<T>(array: T[] | Readonly<T[]>): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function addToUniqueArray<T>(array: T[], values: T | T[]): T[] {
  for (const value of wrapIfNotArray(values)) {
    if (!array.find((a) => a === value)) {
      array.push(value);
    }
  }
  return array;
}

export function addToUniqueArrayBy<T>(
  array: T[],
  byField: keyof T,
  values: T | T[],
): T[] {
  for (const value of wrapIfNotArray(values)) {
    if (!array.find((a) => a[byField] === value[byField])) {
      array.push(value);
    }
  }
  return array;
}

export function ensureArrayExistsAndAddUnique<T>(
  array: T[] | undefined,
  values: T | T[],
): T[] {
  if (!array) {
    array = [];
  }
  return addToUniqueArray(array, values);
}

export function ensureArrayExistsAndAddUniqueBy<T>(
  array: T[] | undefined,
  byField: keyof T,
  values: T | T[],
): T[] {
  if (!array) {
    array = [];
  }
  return addToUniqueArrayBy(array, byField, values);
}

export function removeFromArray<T>(array: T[] | undefined, values: T | T[]) {
  for (const value of Array.isArray(values) ? values : [values]) {
    const idx = array?.findIndex((a) => a === value);
    if (typeof idx == 'number' && idx > -1) {
      array!.splice(idx, 1);
    }
  }
  return array;
}

export function wrapIfNotArray<T>(array: T | T[]): T[] {
  if (Array.isArray(array)) {
    return array;
  }
  return [array];
}

/**
 * Check if a `string` matches a `pattern`, where if the
 * `pattern` is a string a simple equality check is performed
 * and if it is a RegExp a regex match is performed.
 *
 * This differs from the built-in `String.prototype.match`, which
 * coerces the provided pattern to a RegExp.
 */
export function isMatch(stringToCheck: string, pattern: string | RegExp) {
  const matches =
    typeof pattern == 'string'
      ? stringToCheck == pattern
      : stringToCheck.match(pattern);
  return !!matches;
}

/**
 * Create a match filter for `Array.prototype.find` and similar,
 * using {@link isMatch} to test strings for exact string matches
 * or RegExp matches.
 *
 * @param {string} stringFieldName  If provided, match-testing will
 * be run against `stringOrRecord[stringFieldName]` instead of `stringFieldOrName`.
 *                                  .
 */
export function createIsMatchFilter(
  pattern: string | RegExp,
): (string: string) => boolean;
export function createIsMatchFilter<R extends Record<string, any>>(
  pattern: string | RegExp,
  stringFieldName: keyof R,
): (record: R) => boolean;
export function createIsMatchFilter<R extends Record<string, any>>(
  pattern: string | RegExp,
  stringFieldName?: keyof R,
): any {
  return (stringOrRecord: string | R) => {
    if (typeof stringOrRecord != 'string') {
      if (!stringFieldName) {
        return false;
      }
      return isMatch(stringOrRecord[stringFieldName], pattern);
    }
    return isMatch(stringOrRecord, pattern);
  };
}
