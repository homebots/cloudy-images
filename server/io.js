import * as FS from 'fs';
import * as Path from 'path';

const asyncFS = FS.promises;

export function getFilePath(...input) {
  return Path.join(process.cwd(), ...input);
}

export async function readDir(...path) {
  return asyncFS.readdir(getFilePath(...path));
}

export async function readFile(...path) {
  return (await asyncFS.readFile(getFilePath(...path))).toString('utf8').trim();
}