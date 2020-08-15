import { createServer } from 'http';
import { Format, uid, toJson, serialize } from './common.js';

/**
 * @param {Format} configuration.input
 * @param {Format} configuration.output
 * @param {Function} main                         (input, output) => void;
 */
export const lambda = (configuration, main) => new HttpServer(configuration, main);

const Http = {
  Get: 'GET',
  Options: 'OPTIONS',
  Post: 'POST',
};

const timestamp = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

const tryToParseJson = (data) => {
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
};

export class HttpServer {
  constructor(configuration, handler) {
    this.configuration = configuration;
    this.handler = handler;
    this.server = createServer((request, response) => this.dispatch(request, response));
    this.server.listen(process.env.PORT);
  }

  async dispatch(request, response) {
    const { method } = request;

    try {
      if (method === Http.Options) {
        this.setCorsHeaders(request, response);
        response.end();
        return;
      }

      if (method === Http.Get) {
        const host = request.headers['host'];

        response.setHeader(
          'Location',
          'https://github.com/node-lambdas/' + (host.endsWith('.jsfn.run') ? host.replace('.jsfn.run', '') : ''),
        );
        response.writeHead(302);
        response.end('');
        return;
      }

      if (method !== Http.Post) {
        response.writeHead(405);
        response.end('');
        return;
      }

      this.setCorsHeaders(request, response);
      await this.prepareInputAndOutput(request, response);
      this.handler(request, response);
    } catch (error) {
      this.logError(request.id, error);
      response.send(500, { traceId: request.id });
    }
  }

  async prepareInputAndOutput(request, response) {
    request.id = response.id = uid();
    response.request = request;

    await this.augmentRequest(request);
    await this.augmentResponse(response);
  }

  async augmentRequest(request) {
    if (request.method === Http.Post && this.configuration.readBody) {
      await this.deserializeRequest(request);
    }
  }

  async augmentResponse(response) {
    response.header = (name, value) => (response.setHeader(name, value), response);

    const send = (value) => {
      value = this.serialiseResponse(value);
      response.end(value);
      this.logRequest(response, value);
    };

    const onError = (error) => {
      this.logError(response.id, error);
      response.writeHead(500);
      send(toJson({ traceId: response.id }));
    };

    response.send = function (status, body = '') {
      response.header('X-Trace-Id', response.id);

      if (arguments.length === 1) {
        body = status;
        status = 200;
      }

      if (body instanceof Promise) {
        body.then(send, onError);
        return;
      }

      if (status instanceof Error) {
        onError(status);
        return;
      }

      if (arguments.length === 2 || typeof status === 'number') {
        response.writeHead(status);
        send(body);
        return;
      }

      send(status);
    };

    response.reject = (message) => response.send(400, String(message || 'Invalid input'));
  }

  async deserializeRequest(request) {
    return new Promise((resolve) => {
      const inputFormat = this.configuration.input;
      let chunks = [];

      request.on('data', (chunk) => chunks.push(chunk));
      request.on('end', () => {
        const buffer = Buffer.concat(chunks);

        switch (inputFormat) {
          case Format.Json:
            request.body = tryToParseJson(buffer.toString('utf8'));
            break;

          case Format.Text:
            request.body = buffer.toString('utf8');
            break;

          case Format.Buffer:
          default:
            request.body = buffer;
            break;
        }

        resolve();
      });
    });
  }

  setCorsHeaders(_, response) {
    response.setHeader('access-control-allow-origin', '*');
  }

  serialiseResponse(value) {
    switch (this.configuration.output) {
      case Format.Json:
        return toJson(value);

      case Format.Text:
        return value.toString ? value.toString('utf8') : String(value);

      case Format.Buffer:
      default:
        return Buffer.isBuffer(value) ? value : String(value);
    }
  }

  logError(traceId, error) {
    console.log('[error]', timestamp(), traceId, error);
  }

  logRequest(response, responseBody) {
    const { url, method, body, headers, id } = response.request;
    const bodyAsString = serialize(body);
    console.log('[info]', timestamp(), id, [url, bodyAsString, response.statusCode, responseBody]);
  }
}
