import { getFilePath, readDir } from './io.js';
import { LOG } from './log.js';
import { shellExec } from './shell.js';

const dockerRegistry = process.env.CLOUDY_DOCKER_REGISTRY || 'cloudy';

export async function buildAllImages() {
  LOG('info', { message: 'Build started' });

  shellExec('git', ['pull', '--rebase']);
  const images = await getImageList();
  images.forEach(buildImage);
}

export function buildImage(imageName) {
  const tag = `${dockerRegistry}/${imageName}`;
  const args = ['build', '--no-cache', '-t', tag, getFilePath('images', imageName)];

  return shellExec('docker', args);
}

export function publishImage(imageName) {
  const tag = `${dockerRegistry}/${imageName}`;
  return shellExec('docker', ['push', tag]);
}

export async function getImageList() {
  return await readDir('images');
}