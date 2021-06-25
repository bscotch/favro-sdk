import { assertBravoClaim } from './errors.js';

export function stringsMatchIgnoringCase(string1: string, string2: string) {
  for (const val of [string1, string2]) {
    assertBravoClaim(typeof val == 'string', 'All inputs must be strings');
  }
  return (
    string1.toLocaleLowerCase().trim() == string2.toLocaleLowerCase().trim()
  );
}
