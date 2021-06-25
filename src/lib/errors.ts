export class BravoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BravoError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export function assertBravoClaim(
  claim: any,
  message = 'Assertion failed',
): asserts claim {
  if (!claim) {
    throw new BravoError(message);
  }
}
