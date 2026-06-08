const assert = require('node:assert/strict');
const { after, before, beforeEach, test } = require('node:test');

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

beforeEach(() => {
  app.locals.todoCache.length = 0;
});

async function postJson(path, body) {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

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

  const response = await postJson('/api/sample', requestBody);
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

test('GET /api/todos returns an empty list before todos are created', async () => {
  const response = await fetch(`${baseUrl}/api/todos`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.deepEqual(body, {
    message: 'Todo list',
    data: [],
  });
});

test('POST /api/todos stores a todo object', async () => {
  const todo = {
    title: 'Write API tests',
    completed: false,
    priority: 'high',
  };

  const createResponse = await postJson('/api/todos', todo);
  const createBody = await createResponse.json();

  assert.equal(createResponse.status, 201);
  assert.match(createResponse.headers.get('content-type'), /application\/json/);
  assert.deepEqual(createBody, {
    message: 'Todo created',
    data: todo,
  });
});

test('GET /api/todos returns all cached todos in insertion order', async () => {
  const firstTodo = {
    title: 'Write API tests',
    completed: false,
  };
  const secondTodo = {
    title: 'Update GitHub Actions workflow',
    completed: true,
  };

  await postJson('/api/todos', firstTodo);
  await postJson('/api/todos', secondTodo);

  const listResponse = await fetch(`${baseUrl}/api/todos`);
  const listBody = await listResponse.json();

  assert.equal(listResponse.status, 200);
  assert.match(listResponse.headers.get('content-type'), /application\/json/);
  assert.deepEqual(listBody, {
    message: 'Todo list',
    data: [firstTodo, secondTodo],
  });
});

test('POST /api/todos rejects non-object request bodies', async () => {
  const response = await postJson('/api/todos', ['not', 'a', 'todo']);
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.deepEqual(body, {
    message: 'Todo must be a JSON object',
  });
});

test('POST /api/todos does not write invalid todo bodies to cache', async () => {
  await postJson('/api/todos', ['not', 'a', 'todo']);

  const listResponse = await fetch(`${baseUrl}/api/todos`);
  const listBody = await listResponse.json();

  assert.equal(listResponse.status, 200);
  assert.deepEqual(listBody, {
    message: 'Todo list',
    data: [],
  });
});
