const { spawn, execSync } = require('child_process');
const FS = require('fs');
const Path = require('path');

const options = {
  stdio: 'pipe',
  cwd: process.cwd(),
  env: process.env,
};

const { command, args } = getCommand();
console.log(command, args.join(' '));

if (!command) {
  process.exit(1);
}

let restarting = false;
function restart(code) {
  if (restarting) return;

  restarting = true;
  if (code) {
    console.log(`Process exited with code ${code}. Restarting`);
  }

  setTimeout(start, process.env.RESTART_INTERVAL || 2000);
}

function start() {
  restarting = false;

  const shell = spawn(command, args, options);
  const log = (buffer) => console.log(buffer.toString('utf8'));

  shell.stdout.on('data', log);
  shell.stderr.on('data', log);
  shell.on('close', restart);
  shell.on('exit', restart);
  shell.on('error', (error) => {
    console.error(error);
    restart(1);
  });
}

function getCommand() {
  const packageJson = Path.join(process.cwd(), 'package.json');
  const serviceJson = Path.join(process.cwd(), 'service.json');
  const staticsJson = Path.join(process.cwd(), 'superstatic.json');

  if (FS.existsSync(staticsJson)) {
    return { command: 'superstatic', args: ['--port', process.env.PORT, '--host', '0.0.0.0', '--debug', 'true'] };
  }

  if (FS.existsSync(packageJson)) {
    const manifest = require(packageJson);
    if (manifest.scripts && manifest.scripts.start) {
      return { command: 'npm', args: ['start'] };
    }

    if (manifest.main) {
      return { command: 'node', args: [manifest.main] };
    }
  }

  if (FS.existsSync(serviceJson)) {
    const serviceConfig = require(serviceJson);
    if (serviceConfig.domain && serviceConfig.domain.includes('.jsfn.run')) {
      execSync('npm i --no-save @node-lambdas/core@latest');
    }
  }

  if (FS.existsSync(Path.join(process.cwd(), 'index.js'))) {
    return { command: 'node', args: ['index.js'] };
  }

  return { command: '', args: [] };
}

start();
