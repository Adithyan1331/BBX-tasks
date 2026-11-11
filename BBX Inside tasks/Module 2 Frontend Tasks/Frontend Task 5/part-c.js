const http = require('node:http');
const { performance } = require('node:perf_hooks');

async function fetchChecked(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}

async function time(label, operation) {
  const start = performance.now();
  try {
    const result = await operation();
    console.log(`${label}: ${result.length} responses in ${(performance.now() - start).toFixed(1)} ms`);
    return result;
  } catch (error) {
    console.error(`${label} failed:`, error.message);
    throw error;
  }
}

async function main() {
  const server = http.createServer((request, response) => {
    const delay = request.url === '/two' ? 100 : 60;
    setTimeout(() => {
      if (request.url === '/failure') {
        response.writeHead(500, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'intentional server error' }));
        return;
      }
      if (request.url === '/missing') {
        response.writeHead(404, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'not found' }));
        return;
      }
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ endpoint: request.url }));
    }, delay);
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  const healthyUrls = ['/one', '/two', '/three'].map(path => `${baseUrl}${path}`);
  const settledUrls = [`${baseUrl}/one`, `${baseUrl}/failure`, `${baseUrl}/three`];

  try {
    const sequential = await time('Sequential', async () => {
      const results = [];
      for (const url of healthyUrls) {
        results.push(await fetchChecked(url));
      }
      return results;
    });
    console.log('  results:', sequential);

    const parallel = await time('Promise.all', () => Promise.all(healthyUrls.map(fetchChecked)));
    console.log('  results:', parallel);

    const settled = await time('Promise.allSettled', () => Promise.allSettled(settledUrls.map(fetchChecked)));
    console.log('  statuses:', settled.map(result => result.status));
    console.log('  rejection:', settled.find(result => result.status === 'rejected').reason.message);

    const raw404 = await fetch(`${baseUrl}/missing`);
    console.log('Raw fetch 404:', raw404.status, 'ok:', raw404.ok, '(fetch did not throw)');
    try {
      await fetchChecked(`${baseUrl}/missing`);
    } catch (error) {
      console.log('Checked fetch 404:', error.message);
    }
  } finally {
    await new Promise((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
    });
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
