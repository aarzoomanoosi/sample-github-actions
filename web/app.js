const serviceStatus = document.querySelector('#service-status');
const getButton = document.querySelector('#get-button');
const postButton = document.querySelector('#post-button');
const getStatus = document.querySelector('#get-status');
const postStatus = document.querySelector('#post-status');
const getOutput = document.querySelector('#get-output');
const postOutput = document.querySelector('#post-output');
const postBody = document.querySelector('#post-body');
const todoPostButton = document.querySelector('#todo-post-button');
const todoGetButton = document.querySelector('#todo-get-button');
const todoPostStatus = document.querySelector('#todo-post-status');
const todoGetStatus = document.querySelector('#todo-get-status');
const todoPostOutput = document.querySelector('#todo-post-output');
const todoGetOutput = document.querySelector('#todo-get-output');
const todoBody = document.querySelector('#todo-body');

function formatJson(value) {
  return JSON.stringify(value, null, 2);
}

function setServiceStatus(label, state) {
  serviceStatus.textContent = label;
  serviceStatus.className = `status-pill ${state ? `is-${state}` : ''}`.trim();
}

async function parseResponse(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function sendRequest({ endpoint, method, body, output, status, button }) {
  button.disabled = true;
  status.textContent = 'Sending';
  output.textContent = '{}';
  setServiceStatus('Sending', 'loading');

  try {
    const options = { method };

    if (body) {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = body;
    }

    const response = await fetch(endpoint, options);
    const payload = await parseResponse(response);

    status.textContent = `${response.status} ${response.statusText}`;
    output.textContent = typeof payload === 'string' ? payload : formatJson(payload);
    setServiceStatus(response.ok ? 'Success' : 'Error', response.ok ? 'success' : 'error');
  } catch (error) {
    status.textContent = 'Request failed';
    output.textContent = formatJson({ error: error.message });
    setServiceStatus('Error', 'error');
  } finally {
    button.disabled = false;
  }
}

getButton.addEventListener('click', () => {
  sendRequest({
    endpoint: '/api/sample',
    method: 'GET',
    output: getOutput,
    status: getStatus,
    button: getButton,
  });
});

postButton.addEventListener('click', () => {
  let body;

  try {
    body = JSON.stringify(JSON.parse(postBody.value));
  } catch {
    postStatus.textContent = 'Invalid JSON';
    postOutput.textContent = formatJson({ error: 'Request body must be valid JSON.' });
    setServiceStatus('Error', 'error');
    return;
  }

  sendRequest({
    endpoint: '/api/sample',
    method: 'POST',
    body,
    output: postOutput,
    status: postStatus,
    button: postButton,
  });
});

todoPostButton.addEventListener('click', () => {
  let body;

  try {
    body = JSON.stringify(JSON.parse(todoBody.value));
  } catch {
    todoPostStatus.textContent = 'Invalid JSON';
    todoPostOutput.textContent = formatJson({ error: 'Todo body must be valid JSON.' });
    setServiceStatus('Error', 'error');
    return;
  }

  sendRequest({
    endpoint: '/api/todos',
    method: 'POST',
    body,
    output: todoPostOutput,
    status: todoPostStatus,
    button: todoPostButton,
  });
});

todoGetButton.addEventListener('click', () => {
  sendRequest({
    endpoint: '/api/todos',
    method: 'GET',
    output: todoGetOutput,
    status: todoGetStatus,
    button: todoGetButton,
  });
});
