var _ = require("underscore");
var expect = require("chai").expect;

var React = require("react/addons");
var TestUtils = React.addons.TestUtils;

var config = require("../js/config/config");
var AboutModalComponent = require("../js/components/modals/AboutModalComponent");
var InfoActions = require("../js/actions/InfoActions");
var InfoEvents = require("../js/events/InfoEvents");
var InfoStore = require("../js/stores/InfoStore");

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

describe("About Modal", function () {

  beforeEach(function () {
    InfoStore.info = {
      "version": "1.2.3",
      "framework_id": "framework1",
      "leader": "leader1.dcos.io",
      "name": "name1",
      "marathon_config": {
        "marathon_field_1": "mf1",
        "marathon_field_2": "mf2"
      },
      "zookeeper_config": {
        "zookeeper_field_1": "zk1",
        "zookeeper_field_2": "zk2"
      }
    };

    this.renderer = TestUtils.createRenderer();
    this.renderer.render(<AboutModalComponent onDestroy={_.noop} />);
    this.modal = this.renderer.getRenderOutput();

    this.modalBody = ShallowUtils.findOne(this.modal, "modal-body");
    this.modalBodyText = ShallowUtils.getText(this.modalBody);

    this.configDLs = _.filter(this.modalBody.props.children, function (child) {
      return child.type.displayName === "ObjectDlComponent";
    });
  });

  it("displays the current Marathon version", function () {
    var modalTitle = ShallowUtils.findOne(this.modal, "modal-title");
    var titleText = ShallowUtils.getText(modalTitle);
    expect(titleText).to.equal("Version 1.2.3");
  });

  it("displays the current framework id", function () {
    expect(this.modalBodyText).to.contain("framework1");
  });

  it("displays the current leader", function () {
    expect(this.modalBodyText).to.contain("leader1.dcos.io");
  });

  it("displays the current name", function () {
    expect(this.modalBodyText).to.contain("name1");
  });

  it("displays the fields in the marathon config", function () {
    expect(this.configDLs[0]._store.props.object).to.deep.equal({
      "marathon_field_1": "mf1",
      "marathon_field_2": "mf2"
    });
  });

  it("displays the fields in the zookeeper config", function () {
    expect(this.configDLs[1]._store.props.object).to.deep.equal({
      "zookeeper_field_1": "zk1",
      "zookeeper_field_2": "zk2"
    });
  });

});
