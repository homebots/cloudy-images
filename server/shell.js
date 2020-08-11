import { spawnSync } from 'child_process';
import { LOG } from './log.js';

export function shellExec(command, args) {
  try {
    LOG('info', { message: command + ' ' + args.join(' ')});
    const exec = spawnSync(command, args, { stdio: 'pipe', encoding: 'utf8' });

    if (exec.status !== 0) {
      LOG('error', { error: exec.stderr.toString('utf8') });
    } else {
      LOG('info', { message: exec.stdout.toString('utf8') });
    }
  } catch(error) {
    LOG('error', { error: String(error) });
  }
}
