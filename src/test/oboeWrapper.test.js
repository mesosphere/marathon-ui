var expect = require("chai").expect;
var oboe = require("../js/helpers/oboeWrapper");
var config = require("../js/config/config");

var expectAsync = require("./helpers/expectAsync");
var HttpServer = require("./helpers/HttpServer").HttpServer;

var server = new HttpServer(config.localTestserverURI);
config.apiURL = "http://" + server.address + ":" + server.port + "/";

describe("oboeWrapper", function () {

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
      oboe({
        method: "GET",
        url: config.apiURL
      })
      .success(function (response) {
        expectAsync(function () {
          expect(response.name).to.equal("Marathon");
        }, done);
      })
      .error(function () {
        throw new Error("I should not be called");
      });
    });

    it("handles failure gracefully", function (done) {
      this.server.setup({message: "Guru Meditation"}, 404);

      oboe({
        method: "GET",
        url: config.apiURL + "/foo/bar"
      })
      .success(function () {
        throw new Error("I should not be called");
      })
      .error(function (error) {
        expectAsync(function () {
          expect(error.message).to.equal("Guru Meditation");
        }, done);
      });
    });

  });

});
