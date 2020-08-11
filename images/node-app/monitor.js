const spawn = require('child_process').spawn;
const [command, ...args] = process.argv.slice(2);
const options = {
  stdio: 'pipe',
  cwd: process.cwd(),
  env: process.env
};

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
  console.log(command, args.join(' '));

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

start();