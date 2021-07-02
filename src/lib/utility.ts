import { assertBravoClaim } from './errors.js';

export function stringsMatchIgnoringCase(string1: string, string2: string) {
  for (const val of [string1, string2]) {
    assertBravoClaim(typeof val == 'string', 'All inputs must be strings');
  }
  return (
    string1.toLocaleLowerCase().trim() == string2.toLocaleLowerCase().trim()
  );
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
