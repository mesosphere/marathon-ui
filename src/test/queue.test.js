var expect = require("chai").expect;

var config = require("../js/config/config");
var QueueActions = require("../js/actions/QueueActions");
var QueueEvents = require("../js/events/QueueEvents");
var QueueStore = require("../js/stores/QueueStore");

var expectAsync = require("./helpers/expectAsync");
var HttpServer = require("./helpers/HttpServer").HttpServer;

var server = new HttpServer(config.localTestserverURI);
config.apiURL = "http://" + server.address + ":" + server.port + "/";

describe("Queue", function () {

  beforeEach(function (done) {
    this.server = server
    .setup({
      "queue": [
        {
          "app": {
            "id": "/app-1",
            "maxLaunchDelaySeconds": 3600
          },
          "delay": {
            "overdue": false,
            "timeLeftSeconds": 784
          }
        }
      ]
    }, 200)
    .start(function () {
      QueueStore.once(QueueEvents.CHANGE, function () {
        done();
      });
      QueueActions.requestQueue();
    });
  });

  afterEach(function (done) {
    this.server.stop(done);
  });

  describe("on queue request", function () {

    it("updates the QueueStore on success", function (done) {
      QueueStore.once(QueueEvents.CHANGE, function () {
        expectAsync(function () {
          expect(QueueStore.queue).to.have.length(1);
          expect(QueueStore.queue[0].app.id)
            .to.equal("/app-1");
          expect(QueueStore.queue[0].delay.overdue)
            .to.equal(false);
        }, done);
      });

      QueueActions.requestQueue();
    });

    it("handles failure gracefully", function (done) {
      this.server.setup({
        message: "Guru Meditation"
      }, 404);

      QueueStore.once(QueueEvents.REQUEST_ERROR,
          function (error) {
        expectAsync(function () {
          expect(error.message).to.equal("Guru Meditation");
        }, done);
      });

      QueueActions.requestQueue();
    });

    it("returns the right delay time for a delayed app", function (done) {
      QueueStore.once(QueueEvents.CHANGE, function () {
        expectAsync(function () {
          let timeLeftSeconds = QueueStore.getDelayByAppId("/app-1");
          expect(timeLeftSeconds).to.equal(784);
        }, done);
      });

      QueueActions.requestQueue();
    });

  });

  describe("on app delay reset", function () {

    it("respond sucessfully on matching app", function (done) {
      // Payload is empty on a forcefully stoped deployment
      this.server.setup(undefined, 204);

      QueueStore.once(QueueEvents.RESET_DELAY, function (appId) {
        expectAsync(function () {
          expect(appId).to.equal("/app-1");
        }, done);
      });

      QueueActions.resetDelay("/app-1");
    });

    it("handles failure gracefully", function (done) {
      this.server.setup({
        message: "Guru Meditation"
      }, 404);

      QueueStore.once(QueueEvents.RESET_DELAY_ERROR, function (error, appId) {
        expectAsync(function () {
          expect(error.message).to.equal("Guru Meditation");
          expect(appId).to.equal("/app-1");
        }, done);
      });

      QueueActions.resetDelay("/app-1");
    });

  });

});
