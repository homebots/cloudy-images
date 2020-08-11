import { buildAllImages, buildImage, publishImage, getImageList } from './server.js';

export async function cli(command, ...args) {
  switch (command) {
    case 'build-all':
      return buildAllImages();

    case 'build':
      return buildImage(...args);

    case 'publish':
      return publishImage(...args);

    case 'list':
    case 'ls':
      return (await getImageList()).join('\n');

    default:
      throw new Error('Invalid command: ' + command);
  }
}