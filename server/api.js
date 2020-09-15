import { createServer } from 'http';
import { createHmac } from 'crypto';
import { readFile } from './io.js';
import { buildAllImages, getImageList } from './server.js';
import { LOG } from './log.js';

function checkProtectedRoute(req, res, authKey) {
  const requestSignature = req.headers['x-hub-signature'];
  const payloadSignature =
    'sha1=' +
    createHmac('sha1', authKey)
      .update(req.body || '')
      .digest('hex');

  if (payloadSignature !== requestSignature) {
    LOG('error', { message: `Invalid signature: ${requestSignature}, expected ${payloadSignature}` });
    res.writeHead(401, 'Unauthorized');
    res.end();
    return false;
  }

  return true;
}

export async function api() {
  const port = process.env.PORT || 9998;
  const authKey = await readFile('.key');

  async function startBuild(_, res) {
    res.writeHead(202, 'Accepted');
    res.end();

    setTimeout(buildAllImages, 10);
  }

  const server = createServer(async function (request, response) {
    try {
      const { method, url, headers } = request;

      if (method === 'POST') {
        await readRequestBody(request);
      }

      LOG('info', { method, url, headers });

      switch (true) {
        case method === 'POST' && url === '/build' && checkProtectedRoute(request, response, authKey):
          startBuild(request, response);
          break;

        case url === '/':
          const imageList = await getImageList();
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify(imageList.map((imageName) => `${dockerRegistry}/${imageName}`)));
          break;

        default:
          response.writeHead(404);
          response.end();
      }
    } catch (error) {
      LOG('error', error);
      response.writeHead(500);
      response.end();
    }
  });

  server.listen(port);
}

function readRequestBody(request) {
  return new Promise((resolve) => {
    request.body = '';
    request.on('data', (chunk) => (request.body += String(chunk)));
    request.on('end', () => resolve());
  });
}
