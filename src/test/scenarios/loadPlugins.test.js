import {expect} from "chai";
import expectAsync from "./../helpers/expectAsync";
import ajaxWrapperStub from "./../stubs/ajaxWrapperStub";
import JSONPUtilRequestStub from "./../stubs/JSONPUtilRequestStub";

import config from "../../js/config/config";

import ajaxWrapper from "../../js/helpers/ajaxWrapper";
import JSONPUtil from "../../js/helpers/JSONPUtil";
import AppDispatcher from "../../js/AppDispatcher";
import States from "../../js/constants/States";
import PluginActions from "../../js/actions/PluginActions";
import PluginStore from "../../js/stores/PluginStore";
import PluginEvents from "../../js/events/PluginEvents";

describe("load plugins", function () {

  beforeEach(function () {
    PluginStore.resetStore();
    PluginActions.request = ajaxWrapperStub((url, resolve, reject) => {
      switch (url) {
        case `${config.apiURL}v2/plugins`:
          resolve({
            "body": {
              "plugins": [
                {
                  "id": "plugin-id",
                  "implementation": "package.class",
                  "info": {
                    "description": "Plugin description.",
                    "modules": ["ui"],
                    "name": "Plugin Name"
                  },
                  "plugin":
                      "mesosphere.marathon.plugin.http.HttpRequestHandler",
                  "tags": [
                    "ui",
                    "example"
                  ]
                }
              ]
            }
          });
          break;
        default:
          reject({message: "error"});
          break;
      }
    });
    PluginActions.load = JSONPUtilRequestStub((url, resolve, reject) => {
      switch (url) {
        case `${config.apiURL}v2/plugins/plugin-id/main.js`:
          resolve("console.log(\"Example Plugin\");");
          break;
        default:
          reject({message: "error"});
          break;
      }
    });

  });

  afterEach(function () {
    PluginActions.request = ajaxWrapper;
    PluginActions.load = JSONPUtil.request;
  });

  it("updates plugin data on request plugins success", function (done) {
    PluginStore.once(PluginEvents.CHANGE, function () {
      expectAsync(() => {
        expect(PluginStore.getPlugins()).to.deep.equal([
          {
            id: "plugin-id",
            modules: ["ui"],
            name: "Plugin Name",
            description: "Plugin description.",
            state: States.STATE_INITIAL
          }
        ]);
      }, done);
    });

    PluginActions.requestPlugins();
  });

  it("updates plugin data on load plugin success", function (done) {
    var dispatchToken = AppDispatcher.register((action) => {
      if (action.actionType ===
        PluginEvents.LOAD_PLUGIN_SUCCESS) {
        AppDispatcher.unregister(dispatchToken);
        expectAsync(() => {
          expect(PluginStore.getPlugins()).to.deep.equal([
            {
              id: "plugin-id",
              modules: ["ui"],
              name: "Plugin Name",
              description: "Plugin description.",
              state: States.STATE_SUCCESS
            }
          ]);
        }, done);
      }
    });

    PluginActions.requestPlugins();
  });

  it("handles failure gracefully", function (done) {
    PluginActions.load = JSONPUtilRequestStub((url, resolve, reject) => {
      reject({message: "error"});
    });

    var dispatchToken = AppDispatcher.register(function (action) {
      if (action.actionType ===
        PluginEvents.LOAD_PLUGIN_ERROR) {
        AppDispatcher.unregister(dispatchToken);
        expectAsync(() => {
          expect(PluginStore.getPlugins()).to.deep.equal([
            {
              id: "plugin-id",
              modules: ["ui"],
              name: "Plugin Name",
              description: "Plugin description.",
              state: States.STATE_ERROR
            }
          ]);
        }, done);
      }
    });

    PluginActions.requestPlugins();
  });



});
