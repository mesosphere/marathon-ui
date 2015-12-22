var expect = require("chai").expect;
var expectAsync = require("./helpers/expectAsync");
var nock = require("nock");

var config = require("../js/config/config");
var QueueActions = require("../js/actions/QueueActions");
var QueueEvents = require("../js/events/QueueEvents");
var QueueStore = require("../js/stores/QueueStore");

var server = config.localTestserverURI;
config.apiURL = "http://" + server.address + ":" + server.port + "/";

describe("Queue", function () {

  before(function (done) {
    var nockResponse = {
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
    };

    nock(config.apiURL)
      .get("/v2/queue")
      .reply(200, nockResponse);

    QueueStore.once(QueueEvents.CHANGE, done);
    QueueActions.requestQueue();
  });

  describe("on queue request", function () {

    it("updates the QueueStore on success", function () {
      expect(QueueStore.queue).to.have.length(1);
      expect(QueueStore.queue[0].app.id)
        .to.equal("/app-1");
      expect(QueueStore.queue[0].delay.overdue)
        .to.equal(false);
    });

    it("handles failure gracefully", function (done) {
      nock(config.apiURL)
        .get("/v2/queue")
        .reply(404, {
          message: "Guru Meditation"
        });

      QueueStore.once(QueueEvents.REQUEST_ERROR,
          function (error) {
        expectAsync(function () {
          expect(error.message).to.equal("Guru Meditation");
        }, done);
      });

      QueueActions.requestQueue();
    });

    it("returns the right delay time for a delayed app", function () {
      expect(QueueStore.getDelayByAppId("/app-1")).to.equal(784);
    });

  });

  describe("on app delay reset", function () {

    it("respond sucessfully on matching app", function (done) {
      // Payload is empty on a forcefully stopped deployment
      nock(config.apiURL)
        .delete("/v2/queue//app-1/delay")
        .reply(204, undefined);

      QueueStore.once(QueueEvents.RESET_DELAY, function (appId) {
        expectAsync(function () {
          expect(appId).to.equal("/app-1");
        }, done);
      });

      QueueActions.resetDelay("/app-1");
    });

    it("handles failure gracefully", function (done) {
      nock(config.apiURL)
        .delete("/v2/queue//app-1/delay")
        .reply(404, {
          message: "Guru Meditation"
        });

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
