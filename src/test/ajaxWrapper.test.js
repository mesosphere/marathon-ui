var expect = require("chai").expect;
var ajaxWrapper = require("../js/helpers/ajaxWrapper");
var config = require("../js/config/config");

var expectAsync = require("./helpers/expectAsync");
var HttpServer = require("./helpers/HttpServer").HttpServer;

var server = new HttpServer(config.localTestserverURI);
config.apiURL = "http://" + server.address + ":" + server.port + "/";

describe("ajaxWrapper", function () {

  describe("on GET request", function () {

    beforeEach(function () {
      this.server = server
        .setup({
          "name": "Marathon"
        }, 200)
        .start();
    });

    afterEach(function (done) {
      this.server.stop(done);
    });

    it("returns a JSON object on success", function (done) {
      ajaxWrapper({
        method: "GET",
        url: config.apiURL
      })
      .success(function (response) {
        expectAsync(function () {
          expect(response.body.name).to.equal("Marathon");
        }, done);
      })
      .error(function () {
        done(new Error("I should not be called"));
      });
    });

    it("defaults to GET when no method is supplied", function (done) {
      ajaxWrapper({
        url: config.apiURL
      })
      .success(function (response) {
        expectAsync(function () {
          expect(response.body.name).to.equal("Marathon");
        }, done);
      })
      .error(function () {
        done(new Error("I should not be called"));
      });
    });

    it("handles failure gracefully", function (done) {
      this.server.setup({message: "Guru Meditation"}, 404);

      ajaxWrapper({
        method: "GET",
        url: config.apiURL + "/foo/bar"
      })
      .success(function () {
        done(new Error("I should not be called"));
      })
      .error(function (error) {
        expectAsync(function () {
          expect(error.body.message).to.equal("Guru Meditation");
        }, done);
      });
    });

  });

  describe("on concurrent request", function () {

    beforeEach(function () {
      this.server = server
        .setup({
          "name": "Marathon"
        }, 200)
        .start();
    });

    afterEach(function (done) {
      this.server.stop(done);
    });

    it("should timeout on second request", function (done) {
      var responses = 0;
      var timeoutId;
      var initialTimeout = this.timeout();
      this.timeout(50);

      var increaseResponses = function () {
        responses++;
        if (responses === 2) {
          clearTimeout(timeoutId);
          done(new Error("Second request should never be fulfilled"));
        }
      };

      ajaxWrapper({
        method: "GET",
        url: config.apiURL + "/concurrent"
      })
      .success(increaseResponses);

      ajaxWrapper({
        method: "GET",
        url: config.apiURL + "/concurrent"
      })
      .success(increaseResponses);

      timeoutId = setTimeout(() => {
        this.timeout(initialTimeout);
        done();
      }, 25);
    });

    it("should not timeout with flag set", function (done) {
      var responses = 0;

      function increaseResponses() {
        responses++;
        if (responses === 2) {
          done();
        }
      }

      ajaxWrapper({
        method: "GET",
        url: config.apiURL + "/concurrent",
        concurrent: true
      })
      .success(increaseResponses);

      ajaxWrapper({
        method: "GET",
        url: config.apiURL + "/concurrent",
        concurrent: true
      })
      .success(increaseResponses);
    });

  });

  describe("on POST request", function () {

    it("sends the correct payload", function (done) {
      var response = {body: ""};
      var request = {method: null};
      var payload = {"key": "value"};

      this.server.on("request", function (req) {
        request.method = req.method;

        req.addListener("data", function (chunk) {
          response.body += chunk;
        });

        req.addListener("end", function (chunk) {
          if (chunk) {
            response.body += chunk;
          }
        });

      });

      ajaxWrapper({
        method: "POST",
        url: config.apiURL,
        data: payload
      })
        .success(function () {
          expectAsync(function () {
            expect(request.method).to.equal("POST");
            expect(response.body).to.equal(JSON.stringify(payload));
          }, done);
        })
        .error(function () {
          done(new Error("I should not be called"));
        });
    });

    it("handles failure gracefully", function (done) {
      var payload = {"key": "value"};

      this.server.setup({message: "Guru Meditation"}, 404);

      ajaxWrapper({
        method: "POST",
        url: config.apiURL + "/foo/bar",
        data: payload
      })
        .success(function () {
          done(new Error("I should not be called"));
        })
        .error(function (error) {
          expectAsync(function () {
            expect(error.body.message).to.equal("Guru Meditation");
          }, done);
        });
    });

  });

});
