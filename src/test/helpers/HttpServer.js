var http = require("http");

function HttpServer(config) {
  this.port = config.port || 8181;
  this.address = config.address || "localhost";
  this.options = {
    data: null,
    headers: {"Content-Type": "application/json"},
    returnPayload: false,
    resCode: 200
  };
}

HttpServer.prototype.start = function (fn) {

  this.server = http.createServer();

  this.server.on("request", (req, res) => {

    if (this.options.returnPayload === true) {
      this.options.data = {
        payload: "",
        method: req.method
      };

      req.addListener("data", chunk => {
        this.options.data.payload += chunk;
      });

      req.addListener("end", chunk => {
        if (chunk) {
          this.options.data.payload += chunk;
        }
        res.writeHead(this.options.resCode, this.options.headers);
        res.end(JSON.stringify(this.options.data));
      });
    } else {
      res.writeHead(this.options.resCode, this.options.headers);
      res.end(JSON.stringify(this.options.data));
    }
  }).listen(this.port, this.address, fn);

  return this;
};

HttpServer.prototype.on = function (event, fn) {
  this.server.on(event, fn);
};

HttpServer.prototype.setup = function (data, resCode, returnPayload = false) {
  this.options.data = data;
  this.options.resCode = resCode || 200;
  this.options.returnPayload = returnPayload;

  return this;
};

HttpServer.prototype.stop = function (fn) {
  this.server.close();
  if (fn) {
    fn();
  }
};

exports.HttpServer = HttpServer;
