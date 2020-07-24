const FS = require('fs').promises;
const ChildProcess = require('child_process');
const Path = require('path');
const Http = require('http');
const Crypto = require('crypto');
const LOG = (type, args) => console.log(JSON.stringify({ time: Date.now(), type, ...args }));
const dockerRegistry = process.env.DOCKER_REGISTRY;

function checkProtectedRoute(req, res, authKey) {
  const requestSignature = req.headers['x-hub-signature'];
  const payloadSignature = 'sha1=' + Crypto.createHmac('sha1', authKey).update(req.body).digest('hex');

  if (payloadSignature !== requestSignature) {
    LOG('error',  { message: `Invalid signature: ${requestSignature}, expected ${payloadSignature}` });
    res.writeHead(401, 'Unauthorized');
    res.end();
    return false;
  }

  return true;
}

function joinPathWith(input) {
  return Path.join(__dirname, input);
}

async function getImageList() {
  return await FS.readdir(joinPathWith('images'));
}

function readRequestBody(request) {
  return new Promise(resolve => {
    let body = '';
    request.on('data', chunk => body += String(chunk));
    request.on('end', () => resolve(body));
  });
}

function shellExec(command, args) {
  try {
    LOG('info', { message: command + ' ' + args.join(' ')});
    const exec = ChildProcess.spawnSync(command, args, { stdio: 'pipe', encoding: 'utf8' });

    if (exec.status !== 0) {
      LOG('error', { error: exec.stderr.toString('utf8') });
    } else {
      LOG('info', { message: exec.stdout.toString('utf8') });
    }
  } catch(error) {
    LOG('error', { error: String(error) });
  }
}

async function startBuild(_, res) {
  res.writeHead(202, 'Accepted');
  res.end();

  const images = await getImageList();

  setTimeout(() => {
    shellExec('git', ['pull', '--rebase']);

    LOG('info', { message: 'Build started' });
    images.forEach(imageName => {
      const tag = `${dockerRegistry}/${imageName}`;
      const args = ['build', '--quiet', '-t', tag, `images/${imageName}`];
      shellExec('docker', args);
      shellExec('docker', ['push', tag]);
    });
  });
}

async function main(port) {
  const authKey = (await FS.readFile('./.key')).toString('utf8').trim();
  const server = Http.createServer(async function(request, response) {
    const { method, url } = request;
    LOG('info', { method, url });

    if (method === 'POST') {
      request.body = await readRequestBody(request);
    }

    switch(true) {
      case method === 'POST' && url === '/build' && checkProtectedRoute(request, response, authKey):
        startBuild(request, response);
        break;

      case url === '/':
        response.end(JSON.stringify(await getImageList()));
        break;

      default:
        response.writeHead(404);
        response.end();
    }
  });

  server.listen(port);
}

main(process.env.PORT || 9998);