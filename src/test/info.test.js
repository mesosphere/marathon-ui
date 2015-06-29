var expect = require("chai").expect;

var config = require("../js/config/config");
var InfoActions = require("../js/actions/InfoActions");
var InfoEvents = require("../js/events/InfoEvents");
var InfoStore = require("../js/stores/InfoStore");

var expectAsync = require("./helpers/expectAsync");
var HttpServer = require("./helpers/HttpServer").HttpServer;

var server = new HttpServer(config.localTestserverURI);
config.apiURL = "http://" + server.address + ":" + server.port + "/";

describe("Info", function () {

  beforeEach(function (done) {
    this.server = server
    .setup({
      "name": "Marathon"
    }, 200)
    .start(function () {
      InfoStore.once(InfoEvents.CHANGE, done);
      InfoActions.requestInfo();
    });
  });

  afterEach(function (done) {
    this.server.stop(done);
  });

  describe("on info request", function () {

    it("updates the InfoStore on success", function (done) {
      InfoStore.once(InfoEvents.CHANGE, function () {
        expectAsync(function () {
          expect(InfoStore.info.name).to.equal("Marathon");
        }, done);
      });

      InfoActions.requestInfo();
    });

    it("handles failure gracefully", function (done) {
      this.server.setup({message: "Guru Meditation"}, 404);

      InfoStore.once(InfoEvents.REQUEST_ERROR, function (error) {
        expectAsync(function () {
          expect(error.message).to.equal("Guru Meditation");
        }, done);
      });

      InfoActions.requestInfo();
    });

  });

});
