import {expect} from "chai";
import nock from "nock";
import {shallow} from "enzyme";
import React from "react/addons";

import config from "../../js/config/config";

import RejectionStatsComponent from "../../js/components/RejectionStatsComponent";
import QueueActions from "../../js/actions/QueueActions";
import QueueEvents from "../../js/events/QueueEvents";
import QueueStore from "../../js/stores/QueueStore";

describe("RejectionStatsComponent", function () {

  describe("show component", function () {

    before(function (done) {
      var appId = "/app-1";

      var response = {
        "count":5,
        "details": {
            "mem": "4",
            "cpu": "2"
        }
      };

      nock(config.apiURL)
        .get(`/v2/queue/${appId}/stats`)
        .reply(200, response);

      QueueStore.once(QueueEvents.OFFER_STATS, () => {
        this.component = shallow(<RejectionStatsComponent appId={appId} />);
        done();
      });

      QueueActions.getOfferStats(appId);
    });

    it("has correct title", function () {
      expect(this.component.find("div").find(".panel-heading").at(0).text()).to.equal("Last 5 Rejections");
    });

    it("has correct table header", function () {
      expect(this.component.find("th").at(0).text()).to.equal("Resources");
      expect(this.component.find("th").at(1).text()).to.equal("Rejected Count");
      expect(this.component.find("th").at(2).text()).to.equal("Matches");
    });

    it("has correct table values", function () {
      expect(this.component.find("td").at(0).text()).to.equal("mem");
      expect(this.component.find("td").at(1).text()).to.equal("4");
      expect(this.component.find("td").at(2).text()).to.equal("20.00%");

      expect(this.component.find("td").at(3).text()).to.equal("cpu");
      expect(this.component.find("td").at(4).text()).to.equal("2");
      expect(this.component.find("td").at(5).text()).to.equal("60.00%");
    });
  });

});
