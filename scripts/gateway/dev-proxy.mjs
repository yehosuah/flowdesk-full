import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import tls from 'node:tls';

const gatewayHost = process.env.FLOWDESK_GATEWAY_HOST ?? '0.0.0.0';
const gatewayPort = Number.parseInt(process.env.FLOWDESK_GATEWAY_PORT ?? '8080', 10);
const frontendUrl = new URL(process.env.FLOWDESK_FRONTEND_URL ?? 'http://127.0.0.1:5173');
const backendUrl = new URL(process.env.FLOWDESK_BACKEND_URL ?? 'http://127.0.0.1:8000');

function getTarget(pathname = '/') {
  return pathname === '/api' || pathname.startsWith('/api/') ? backendUrl : frontendUrl;
}

function getPort(target) {
  if (target.port) {
    return Number.parseInt(target.port, 10);
  }

  return target.protocol === 'https:' ? 443 : 80;
}

function forwardedHeaders(req, target) {
  const headers = { ...req.headers };
  headers.host = target.host;
  headers['x-forwarded-host'] = req.headers.host ?? `${gatewayHost}:${gatewayPort}`;
  headers['x-forwarded-proto'] = req.socket.encrypted ? 'https' : 'http';

  const remoteAddress = req.socket.remoteAddress ?? '';
  headers['x-forwarded-for'] = headers['x-forwarded-for']
    ? `${headers['x-forwarded-for']}, ${remoteAddress}`
    : remoteAddress;

  return headers;
}

function writeBadGateway(resOrSocket, target, error) {
  const message = `Bad gateway while contacting ${target.origin}: ${error.message}`;

  if ('writeHead' in resOrSocket) {
    resOrSocket.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    resOrSocket.end(JSON.stringify({ detail: message }));
    return;
  }

  if (resOrSocket.writable) {
    resOrSocket.end(`HTTP/1.1 502 Bad Gateway\r\nContent-Length: ${Buffer.byteLength(message)}\r\n\r\n${message}`);
  }
}

const server = http.createServer((req, res) => {
  const target = getTarget(req.url ?? '/');
  const transport = target.protocol === 'https:' ? https : http;

  const upstream = transport.request(
    {
      protocol: target.protocol,
      hostname: target.hostname,
      port: getPort(target),
      method: req.method,
      path: req.url,
      headers: forwardedHeaders(req, target),
    },
    (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode ?? 502, upstreamRes.headers);
      upstreamRes.pipe(res);
    },
  );

  upstream.on('error', (error) => writeBadGateway(res, target, error));
  req.pipe(upstream);
});

server.on('upgrade', (req, socket, head) => {
  const target = getTarget(req.url ?? '/');
  const connect =
    target.protocol === 'https:'
      ? tls.connect({
          host: target.hostname,
          port: getPort(target),
          servername: target.hostname,
        })
      : net.connect({
          host: target.hostname,
          port: getPort(target),
        });

  const readyEvent = target.protocol === 'https:' ? 'secureConnect' : 'connect';

  connect.on(readyEvent, () => {
    const headerLines = [];

    for (let index = 0; index < req.rawHeaders.length; index += 2) {
      const name = req.rawHeaders[index];
      const value = req.rawHeaders[index + 1];
      if (name.toLowerCase() === 'host') {
        continue;
      }

      headerLines.push(`${name}: ${value}`);
    }

    headerLines.push(`Host: ${target.host}`);
    headerLines.push(`X-Forwarded-For: ${req.socket.remoteAddress ?? ''}`);
    headerLines.push(`X-Forwarded-Proto: ${req.socket.encrypted ? 'https' : 'http'}`);

    connect.write(
      `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n${headerLines.join('\r\n')}\r\n\r\n`,
    );

    if (head.length > 0) {
      connect.write(head);
    }

    socket.pipe(connect).pipe(socket);
  });

  connect.on('error', (error) => writeBadGateway(socket, target, error));
  socket.on('error', () => connect.destroy());
});

server.listen(gatewayPort, gatewayHost, () => {
  console.log(`Flowdesk dev gateway listening on http://${gatewayHost}:${gatewayPort}`);
  console.log(`Frontend upstream: ${frontendUrl.origin}`);
  console.log(`Backend upstream: ${backendUrl.origin}`);
});
