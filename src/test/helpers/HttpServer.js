var http = require("http");

function HttpServer(config) {
  this.port = config.port || 8181;
  this.address = config.address || "localhost";
  this.options = {
    data: null,
    resCode: 200
  };
}

HttpServer.prototype.start = function (fn) {
  this.server = http.createServer(function (req, res) {
    res.writeHead(this.options.resCode, {"Content-Type": "application/json"});
    res.end(JSON.stringify(this.options.data));
  }.bind(this)).listen(this.port, this.address, fn);
  return this;
};

HttpServer.prototype.setup = function (data, resCode) {
  this.options.data = data;
  this.options.resCode = resCode || 200;
  return this;
};

HttpServer.prototype.on = function (event, fn) {
  this.server.on(event, fn);
};

HttpServer.prototype.stop = function (fn) {
  this.server.close();
  if (fn) {
    fn();
  }
};

exports.HttpServer = HttpServer;
