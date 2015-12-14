var _ = require("underscore");
var expect = require("chai").expect;
var mount = require("enzyme").mount;
var describeWithDOM = require("enzyme").describeWithDOM;

var React = require("react/addons");

var config = require("../js/config/config");
var AboutModalComponent = require("../js/components/modals/AboutModalComponent");
var InfoActions = require("../js/actions/InfoActions");
var InfoEvents = require("../js/events/InfoEvents");
var InfoStore = require("../js/stores/InfoStore");
var ObjectDlComponent = require("../js/components/ObjectDlComponent");

var ShallowUtils = require("./helpers/ShallowUtils");
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
      this.server.setup({
        message: "Guru Meditation"
      }, 404);

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

  beforeEach(function () {
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

    this.modal = mount(<AboutModalComponent onDestroy={_.noop} />);
    this.nodes = {
      modalTitleText: this.modal.find(".modal-title").text(),
      modalBodyText: this.modal.find(".modal-body").text(),
      objectDlComponents: this.modal.find(ObjectDlComponent)
    };
  });

  afterEach(function () {
    this.renderer.unmount();
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
