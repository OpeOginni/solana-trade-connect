var http = require("http"),
  httpProxy = require("http-proxy");

const GITPOD_RUN_URL = "";

httpProxy.createProxyServer({ target: GITPOD_RUN_URL, changeOrigin: true }).listen(8899);
console.log("listening on: 8899");
