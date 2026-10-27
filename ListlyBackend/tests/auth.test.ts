import assert from 'node:assert/strict';
import { AddressInfo } from 'node:net';
import { app } from '../src/app.js';

const server = app.listen(0, '127.0.0.1');

async function run() {
  try {
    await new Promise<void>(resolve => server.once('listening', resolve));
    const address = server.address() as AddressInfo;
    const baseUrl = `http://127.0.0.1:${address.port}/api`;

    const healthResponse = await fetch(`${baseUrl}/health`);
    assert.equal(healthResponse.status, 200);

    const protectedResponse = await fetch(`${baseUrl}/lists`);
    assert.equal(protectedResponse.status, 401);
    assert.equal((await protectedResponse.json() as { error: { code: string } }).error.code, 'UNAUTHORIZED');

    const invalidCredentialsResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalid-email', password: 'short' }),
    });
    assert.equal(invalidCredentialsResponse.status, 400);
    assert.equal((await invalidCredentialsResponse.json() as { error: { code: string } }).error.code, 'VALIDATION_ERROR');

    console.log('Authentication tests passed');
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
    });
  }
}

void run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
