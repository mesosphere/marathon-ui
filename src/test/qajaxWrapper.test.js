var expect = require("chai").expect;
var qajax = require("../js/helpers/qajaxWrapper");
var config = require("../js/config/config");

var expectAsync = require("./helpers/expectAsync");
var HttpServer = require("./helpers/HttpServer").HttpServer;

var server = new HttpServer(config.localTestserverURI);
config.apiURL = "http://" + server.address + ":" + server.port + "/";

describe("qajaxWrapper", function () {

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

  describe("on GET request", function () {

    it("returns a JSON object on success", function (done) {
      qajax({
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

    it("handles failure gracefully", function (done) {
      this.server.setup({message: "Guru Meditation"}, 404);

      qajax({
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

      qajax({
        method: "GET",
        url: config.apiURL + "/concurrent"
      })
      .success(increaseResponses);

      qajax({
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

      qajax({
        method: "GET",
        url: config.apiURL + "/concurrent",
        concurrent: true
      })
      .success(increaseResponses);

      qajax({
        method: "GET",
        url: config.apiURL + "/concurrent",
        concurrent: true
      })
      .success(increaseResponses);
    });

  });

});
