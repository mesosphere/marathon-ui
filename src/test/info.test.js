var _ = require("underscore");
var expect = require("chai").expect;
var expectAsync = require("./helpers/expectAsync");
var shallow = require("enzyme").shallow;
var nock = require("nock");
var describeWithDOM = require("enzyme").describeWithDOM;

var React = require("react/addons");

var config = require("../js/config/config");
var AboutModalComponent = require(
  "../js/components/modals/AboutModalComponent");
var InfoActions = require("../js/actions/InfoActions");
var InfoEvents = require("../js/events/InfoEvents");
var InfoStore = require("../js/stores/InfoStore");
var ObjectDlComponent = require("../js/components/ObjectDlComponent");

var server = config.localTestserverURI;
config.apiURL = "http://" + server.address + ":" + server.port + "/";

describe("Info", function () {

  before(function (done) {
    nock(config.apiURL)
      .get("/v2/info")
      .reply(200, {"name": "Marathon"});
    InfoStore.once(InfoEvents.CHANGE, done);
    InfoActions.requestInfo();
  });

  describe("on info request", function () {

    it("updates the InfoStore on success", function () {
      expect(InfoStore.info.name).to.equal("Marathon");
    });

    it("handles failure gracefully", function (done) {
      nock(config.apiURL)
        .get("/v2/info")
        .reply(404, {message: "Guru Meditation"});

      InfoStore.once(InfoEvents.REQUEST_ERROR, function (error) {
        expectAsync(function () {
          expect(error.message).to.equal("Guru Meditation");
        }, done);
      });

      InfoActions.requestInfo();
    });

  });

});

describeWithDOM("About Modal", function () {

  before(function () {
    InfoStore.info = {
      "version": "1.2.3",
      "frameworkId": "framework1",
      "leader": "leader1.dcos.io",
      "marathon_config": {
        "marathon_field_1": "mf1",
        "marathon_field_2": "mf2"
      },
      "zookeeper_config": {
        "zookeeper_field_1": "zk1",
        "zookeeper_field_2": "zk2"
      }
    };

    this.component = shallow(<AboutModalComponent onDestroy={_.noop} />);
    this.nodes = {
      modalTitleText: this.component.find(".modal-title").text(),
      modalBodyText: this.component.find(".modal-body").text(),
      objectDlComponents: this.component.find(ObjectDlComponent)
    };
  });

  after(function () {
    this.component.instance().componentWillUnmount();
  });

  it("displays the current Marathon version", function () {
    expect(this.nodes.modalTitleText).to.equal("Version 1.2.3");
  });

  it("displays the current framework id", function () {
    expect(this.nodes.modalBodyText).to.contain("framework1");
  });

  it("displays the current leader", function () {
    expect(this.nodes.modalBodyText).to.contain("leader1.dcos.io");
  });

  it("displays the fields in the marathon config", function () {
    var objectDlComponent = this.nodes.objectDlComponents.first();
    var props = objectDlComponent.first().props().object;
    expect(props).to.deep.equal({
      "marathon_field_1": "mf1",
      "marathon_field_2": "mf2"
    });
  });

  it("displays the fields in the zookeeper config", function () {
    var objectDlComponent = this.nodes.objectDlComponents.at(1);
    var props = objectDlComponent.first().props().object;
    expect(props).to.deep.equal({
      "zookeeper_field_1": "zk1",
      "zookeeper_field_2": "zk2"
    });
  });

});
