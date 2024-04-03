var http = require("http"),
  httpProxy = require("http-proxy");

const GITPOD_RPC_URL = "";
const GITPOD_WEBSOCKET_URL = "";

// Create server for HTTP requests
var server = http
  .createServer(function (req, res) {
    proxy.web(req, res, { target: GITPOD_RPC_URL, changeOrigin: true });
  })
  .listen(8899);

console.log("HTTP Proxy listening on: 8899");

// Create server for WebSocket requests
var wsServer = http.createServer(function (req, res) {
  proxy.web(req, res, { target: GITPOD_WEBSOCKET_URL, changeOrigin: true });
});

wsServer.on("upgrade", function (req, socket, head) {
  proxy.ws(req, socket, head, { target: GITPOD_WEBSOCKET_URL, changeOrigin: true });
});

wsServer.listen(8900);
console.log("WebSocket Proxy listening on: 8900");
