import { assertBravoClaim } from './errors.js';

export function stringsMatchIgnoringCase(string1: string, string2: string) {
  for (const val of [string1, string2]) {
    assertBravoClaim(typeof val == 'string', 'All inputs must be strings');
  }
  return (
    string1.toLocaleLowerCase().trim() == string2.toLocaleLowerCase().trim()
  );
}

export function findRequiredByField<
  Item extends Record<string, any>,
  Field extends keyof Item,
>(findIn: Item[], byField: Field, value: Item[Field]): Item {
  assertBravoClaim(findIn, 'Search array does not exist');
  const item = findIn.find((item) => item[byField] == value);
  assertBravoClaim(item, 'Matching entity not found');
  return item;
}
