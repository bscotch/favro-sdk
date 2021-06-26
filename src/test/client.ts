import { BravoClient } from '@/BravoClient.js';
import { expect } from 'chai';
import fs from 'fs-extra';
import dotenv from 'dotenv';

export class BravoTestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BravoTestError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export function assertBravoTestClaim(
  claim: any,
  message = 'Assertion failed',
): asserts claim {
  if (!claim) {
    throw new BravoTestError(message);
  }
}

/**
 * @note A root .env file must be populated with the required
 * env vars in order to run tests!
 */
dotenv.config();

const organizationName = process.env.FAVRO_ORGANIZATION_NAME!;
assertBravoTestClaim(
  organizationName,
  `For testing, you must include FAVRO_ORGANIZATION_NAME in your .env file`,
);
const myUserEmail = process.env.FAVRO_USER_EMAIL!;
assertBravoTestClaim(
  organizationName,
  `For testing, you must include FAVRO_USER_EMAIL in your .env file`,
);

const sandboxRoot = './sandbox';
const samplesRoot = './samples';

/**
 * Clone any files in a "./samples" folder into
 * a "./sandbox" folder, overwriting any files
 * currently in there. This is useful for allowing
 * your test suite to make changes to files without
 * changing the originals, so that you can easily
 * reset back to an original state prior to running a test.
 */
function resetSandbox() {
  if (!fs.existsSync(samplesRoot)) {
    // Then no samples exist, and no sandbox needed
    return;
  }
  fs.ensureDirSync(sandboxRoot);
  fs.emptyDirSync(sandboxRoot);
  fs.copySync(samplesRoot, sandboxRoot);
}

describe('BravoClient', function () {
  // Use a single client for tests, so that we can
  // do some caching and avoid hitting the strict
  // rate limits.

  const client = new BravoClient();

  before(function () {
    resetSandbox();
  });

  it('can list organizations', async function () {
    const organizations = await client.listOrganizations();
    expect(organizations.length).to.be.greaterThan(0);
  });

  it('can find a specific organization and set it as the current one', async function () {
    const org = await client.findOrganizationByName(
      process.env.FAVRO_ORGANIZATION_NAME!,
    );
    assertBravoTestClaim(org, 'Org not found');
    assertBravoTestClaim(
      org.organizationId,
      'Organization ID not found on org data',
    );
    client.organizationId = org.organizationId;
    assertBravoTestClaim(org.organizationId == client.organizationId);
  });

  it('can find all users for an organization, including self', async function () {
    await client.setOrganizationIdByName(organizationName);
    const partialUsers = await client.listPartialUsers();
    expect(partialUsers.length, 'has partial users').to.be.greaterThan(0);
    const fullUsers = await client.listFullUsers();
    expect(fullUsers.length, 'has full users').to.be.greaterThan(0);
    const me = fullUsers.find((u) => u.email == myUserEmail);
    assertBravoTestClaim(me, 'Current user somehow not found in org');
  });

  after(function () {
    resetSandbox();
  });
});
