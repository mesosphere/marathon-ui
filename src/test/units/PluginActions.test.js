import {expect} from "chai";
import expectAsync from "./../helpers/expectAsync";
import ajaxWrapperStub from "./../stubs/ajaxWrapperStub";
import JSONPUtilRequestStub from "./../stubs/JSONPUtilRequestStub";

import config from "../../js/config/config";

import ajaxWrapper from "../../js/helpers/ajaxWrapper";
import JSONPUtil from "../../js/helpers/JSONPUtil";
import Messages from "../../js/constants/Messages";
import AppDispatcher from "../../js/AppDispatcher";
import PluginActions from "../../js/actions/PluginActions";
import PluginEvents from "../../js/events/PluginEvents";

describe("PluginActions", function () {

  describe("request available plugins", function () {

    beforeEach(function () {
      PluginActions.request = ajaxWrapperStub((url, resolve, reject) => {
        switch (url) {
          case `${config.apiURL}v2/plugins`:
            resolve({
              "plugins": [
                {
                  "id": "plugin-id",
                  "implementation": "package.class",
                  "info": {
                    "ui": true,
                    "name": "Plugin Name",
                    "description": "Plugin description.",
                    "main": "main.js"
                  },
                  "plugin":
                    "mesosphere.marathon.plugin.http.HttpRequestHandler",
                  "tags": [
                    "ui",
                    "example"
                  ]
                }
              ]
            });
            break;
          default:
            reject({message: "error"});
            break;
        }
      });
    });

    afterEach(function () {
      PluginActions.request = ajaxWrapper;
    });

    it("retrieves list of plugins", function (done) {
      var dispatchToken = AppDispatcher.register((action) => {
        if (action.actionType ===
          PluginEvents.REQUEST_PLUGINS_SUCCESS) {
          AppDispatcher.unregister(dispatchToken);
          expectAsync(() => {
            expect(action.data).to.deep.equal([
              {
                "id": "plugin-id",
                "implementation": "package.class",
                "info": {
                  "ui": true,
                  "name": "Plugin Name",
                  "description": "Plugin description.",
                  "main": "main.js"
                },
                "plugin": "mesosphere.marathon.plugin.http.HttpRequestHandler",
                "tags": [
                  "ui",
                  "example"
                ]
              }
            ]);
          }, done);
        }
      });

      PluginActions.requestPlugins();
    });

    it("handles failure gracefully", function (done) {
      PluginActions.request = ajaxWrapperStub((url, resolve, reject) => {
        reject({message: "error"});
      });
      var dispatchToken = AppDispatcher.register(function (action) {
        if (action.actionType ===
          PluginEvents.REQUEST_PLUGINS_ERROR) {
          AppDispatcher.unregister(dispatchToken);
          expectAsync(() => {
            expect(action.data.message).to.equal("error");
          }, done);
        }
      });

      PluginActions.requestPlugins();
    });

    it("handles malformed responses gracefully", function (done) {
      PluginActions.request = ajaxWrapperStub((url, resolve, reject) => {
        resolve({
          "plugins": {
            "object": "instead of an array"
          }
        });
      });
      var dispatchToken = AppDispatcher.register(function (action) {
        if (action.actionType ===
          PluginEvents.REQUEST_PLUGINS_ERROR) {
          AppDispatcher.unregister(dispatchToken);
          expectAsync(() => {
            expect(action.data.message).to.equal(Messages.MALFORMED);
          }, done);
        }
      });

      PluginActions.requestPlugins();
    });

  });

});
