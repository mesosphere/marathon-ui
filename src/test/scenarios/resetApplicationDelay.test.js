import {expect} from "chai";
import nock from "nock";
import expectAsync from "./../helpers/expectAsync";

import config from "../../js/config/config";

import QueueActions from "../../js/actions/QueueActions";
import QueueEvents from "../../js/events/QueueEvents";
import QueueStore from "../../js/stores/QueueStore";

describe("reset application delay", function () {

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
