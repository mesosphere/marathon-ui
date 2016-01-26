import {expect} from "chai";
import nock from "nock";
import expectAsync from "./../helpers/expectAsync";

import config from "../../js/config/config";

import QueueActions from "../../js/actions/QueueActions";
import QueueEvents from "../../js/events/QueueEvents";
import QueueStore from "../../js/stores/QueueStore";

describe("request queue", function () {

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
