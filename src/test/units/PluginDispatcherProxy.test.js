// @todo Replace with es6 import once sinonjs/sinon#830 is fixed
var sinon = require("sinon");
import {expect} from "chai";
import expectAsync from "./../helpers/expectAsync";
import PluginDispatcherProxy from "../../js/plugin/PluginDispatcherProxy";

describe("PluginDispatcherProxy", function () {

  beforeEach(function () {
    this.dispatcher = PluginDispatcherProxy.create("test-id");
  });

  afterEach(function () {
    this.dispatcher = null;
  });

  it("should throw an error if no valid  plugin id is supplied", function () {

    expect(()=> PluginDispatcherProxy.create()).to.throw(TypeError);
    expect(()=> PluginDispatcherProxy.create(null)).to.throw(TypeError);
    expect(()=> PluginDispatcherProxy.create("")).to.throw(TypeError);
    expect(()=> PluginDispatcherProxy.create({})).to.throw(TypeError);

  });

  it("should add plugin id as payload", function (done) {
    var dispatchToken = this.dispatcher.register((event) => {
      if (event.eventType === "TEST_EVENT") {
        this.dispatcher.unregister(dispatchToken);
        expectAsync(() => {
          expect(event.pluginId).to.equal("test-id");
        }, done);
      }
    });

    this.dispatcher.dispatch({eventType: "TEST_EVENT"});

  });

  it("should overwrite wrong plugin ids", function (done) {
    var dispatchToken = this.dispatcher.register((event) => {
      if (event.eventType === "TEST_EVENT") {
        this.dispatcher.unregister(dispatchToken);
        expectAsync(() => {
          expect(event.pluginId).to.equal("test-id");
        }, done);
      }
    });

    this.dispatcher.dispatch({eventType: "TEST_EVENT", pluginId: "fake"});
  });

  it("should not remove data from payload", function (done) {
    var dispatchToken = this.dispatcher.register((event) => {
      if (event.eventType === "TEST_EVENT") {
        this.dispatcher.unregister(dispatchToken);
        expectAsync(() => {
          expect(event.message).to.equal("test");
        }, done);
      }
    });

    this.dispatcher.dispatch({eventType: "TEST_EVENT", message: "test"});
  });

  it("should execute all subscriber callbacks", function () {
    var callbackA = sinon.spy();
    var callbackB = sinon.spy();
    var payload = {};

    this.dispatcher.register(callbackA);
    this.dispatcher.register(callbackB);

    this.dispatcher.dispatch(payload);

    expect(callbackA.callCount).to.equal(1);
    expect(callbackA.calledWith(payload)).to.equal(true);

    expect(callbackB.callCount).to.equal(1);
    expect(callbackB.calledWith(payload)).to.equal(true);

    this.dispatcher.dispatch(payload);

    expect(callbackA.callCount).to.equal(2);
    expect(callbackA.calledWith(payload)).to.equal(true);

    expect(callbackB.callCount).to.equal(2);
    expect(callbackB.calledWith(payload)).to.equal(true);
  });

  it("should properly unregister callbacks", function () {
    const callbackA = sinon.spy();
    const callbackB = sinon.spy();
    var payload = {};

    this.dispatcher.register(callbackA);
    var tokenB = this.dispatcher.register(callbackB);
    this.dispatcher.dispatch(payload);
    this.dispatcher.unregister(tokenB);
    this.dispatcher.dispatch(payload);

    expect(callbackA.callCount).to.equal(2);
    expect(callbackA.calledWith(payload)).to.equal(true);

    expect(callbackB.callCount).to.equal(1);
    expect(callbackB.calledWith(payload)).to.equal(true);
  });

  it("should wait for callbacks", function () {
    const callbackA = sinon.spy();
    const callbackB = sinon.spy();
    var payload = {};

    var tokenA = this.dispatcher.register(callbackA);

    this.dispatcher.register((payload) => {
      this.dispatcher.waitFor([tokenA]);
      expect(callbackA.callCount).to.equal(1);
      expect(callbackA.calledWith(payload)).to.equal(true);
      callbackB(payload);
    });

    this.dispatcher.dispatch(payload);

    expect(callbackA.callCount).to.equal(1);
    expect(callbackA.calledWith(payload)).to.equal(true);

    expect(callbackB.callCount).to.equal(1);
    expect(callbackB.calledWith(payload)).to.equal(true);

  });

});
