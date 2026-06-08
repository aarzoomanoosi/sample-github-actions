const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');

const app = require('../api');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, '127.0.0.1');

  await new Promise((resolve) => {
    server.once('listening', resolve);
  });

  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
});

test('GET /api/sample returns dummy sample data', async () => {
  const response = await fetch(`${baseUrl}/api/sample`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.deepEqual(body, {
    message: 'Sample GET endpoint',
    data: {
      id: 1,
      name: 'Dummy User',
      role: 'developer',
    },
  });
});

test('POST /api/sample returns created dummy data and echoes request body', async () => {
  const requestBody = {
    name: 'Test User',
    role: 'developer',
  };

  const response = await fetch(`${baseUrl}/api/sample`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.deepEqual(body, {
    message: 'Sample POST endpoint',
    received: requestBody,
    data: {
      id: 2,
      name: 'Created Dummy User',
      role: 'tester',
    },
  });
});
