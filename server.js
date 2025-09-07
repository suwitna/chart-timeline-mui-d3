const next = require('next');
const http = require('http');

const port = 3001;
const hostname = '0.0.0.0'; // ✅ ทำให้เครื่องอื่นในวง LAN เข้าได้

const app = next({ dev: true, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http.createServer((req, res) => {
    handle(req, res);
  }).listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
