import {expect} from "chai";
import expectAsync from "./../helpers/expectAsync";
import ajaxWrapperStub from "./../stubs/ajaxWrapperStub";
import PluginLoaderLoadStub from "./../stubs/PluginLoaderLoadStub";

import config from "../../js/config/config";

import ajaxWrapper from "../../js/helpers/ajaxWrapper";
import PluginLoader from "../../js/plugin/PluginLoader";
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
    PluginActions.load = PluginLoaderLoadStub((url, resolve, reject) => {
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
    PluginActions.load = PluginLoader.load;
  });

  it("updates plugin data on request plugins success", function (done) {
    PluginStore.once(PluginEvents.CHANGE, function () {
      expectAsync(() => {
        expect(PluginStore.pluginsLoadingState)
          .to.equal(States.STATE_INITIAL);
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
          expect(PluginStore.pluginsLoadingState)
            .to.equal(States.STATE_SUCCESS);
        }, done);
      }
    });

    PluginActions.requestPlugins();
  });

  it("handles plugin request failure gracefully", function (done) {
    PluginActions.request = ajaxWrapperStub((url, resolve, reject) => {
      reject({message: "error"});
    });

    var dispatchToken = AppDispatcher.register(function (action) {
      if (action.actionType ===
        PluginEvents.REQUEST_PLUGINS_ERROR) {
        AppDispatcher.unregister(dispatchToken);
        expectAsync(() => {
          expect(PluginStore.pluginsLoadingState)
            .to.equal(States.STATE_ERROR);
        }, done);
      }
    });

    PluginActions.requestPlugins();
  });

  it("handles empty plugin request response  gracefully", function (done) {
    PluginActions.request = ajaxWrapperStub((url, resolve) => {
      resolve({
        "body": {
          "plugins": []
        }
      });
    });

    var dispatchToken = AppDispatcher.register(function (action) {
      if (action.actionType ===
        PluginEvents.REQUEST_PLUGINS_SUCCESS) {
        AppDispatcher.unregister(dispatchToken);
        expectAsync(() => {
          expect(PluginStore.pluginsLoadingState)
            .to.equal(States.STATE_SUCCESS);
        }, done);
      }
    });

    PluginActions.requestPlugins();
  });

  it("handles missing modules metadata in plugin request response gracefully",
    function (done) {
      PluginActions.request = ajaxWrapperStub((url, resolve) => {
        resolve({
          "body": {
            "plugins": [
              {
                "id": "plugin-id",
                "implementation": "package.class",
                "info": {
                  "description": "Plugin description.",
                  "name": "Plugin Name"
                },
                "plugin": "mesosphere.marathon.plugin.http.HttpRequestHandler",
                "tags": [
                  "ui",
                  "example"
                ]
              }
            ]
          }
        });
      });

      var dispatchToken = AppDispatcher.register(function (action) {
        if (action.actionType ===
          PluginEvents.REQUEST_PLUGINS_SUCCESS) {
          AppDispatcher.unregister(dispatchToken);
          expectAsync(() => {
            expect(PluginStore.pluginsLoadingState)
              .to.equal(States.STATE_SUCCESS);
          }, done);
        }
      });

      PluginActions.requestPlugins();
    }
  );

  it("handles empty modules metadata in plugin request response gracefully",
    function (done) {
      PluginActions.request = ajaxWrapperStub((url, resolve) => {
        resolve({
          "body": {
            "plugins": [
              {
                "id": "plugin-id",
                "implementation": "package.class",
                "info": {
                  "description": "Plugin description.",
                  "modules": [],
                  "name": "Plugin Name"
                },
                "plugin": "mesosphere.marathon.plugin.http.HttpRequestHandler",
                "tags": [
                  "ui",
                  "example"
                ]
              }
            ]
          }
        });
      });

      var dispatchToken = AppDispatcher.register(function (action) {
        if (action.actionType ===
          PluginEvents.REQUEST_PLUGINS_SUCCESS) {
          AppDispatcher.unregister(dispatchToken);
          expectAsync(() => {
            expect(PluginStore.pluginsLoadingState)
              .to.equal(States.STATE_SUCCESS);
          }, done);
        }
      });

      PluginActions.requestPlugins();
    }
  );

  it("handles service plugins in plugin request response gracefully",
    function (done) {
      PluginActions.request = ajaxWrapperStub((url, resolve) => {
        resolve({
          "body": {
            "plugins": [
              {
                "id": "plugin-id",
                "implementation": "package.class",
                "info": {
                  "description": "Plugin description.",
                  "modules": ["service"],
                  "name": "Plugin Name"
                },
                "plugin": "mesosphere.marathon.plugin.http.HttpRequestHandler",
                "tags": [
                  "ui",
                  "example"
                ]
              }
            ]
          }
        });
      });

      var dispatchToken = AppDispatcher.register(function (action) {
        if (action.actionType ===
          PluginEvents.REQUEST_PLUGINS_SUCCESS) {
          AppDispatcher.unregister(dispatchToken);
          expectAsync(() => {
            expect(PluginStore.pluginsLoadingState)
              .to.equal(States.STATE_SUCCESS);
          }, done);
        }
      });

      PluginActions.requestPlugins();
    }
  );

  it("handles empty modules metadata in plugin request response gracefully",
    function (done) {
      PluginActions.request = ajaxWrapperStub((url, resolve) => {
        resolve({
          "body": {
            "plugins": [
              {
                "id": "plugin-id",
                "implementation": "package.class",
                "info": {
                  "description": "Plugin description.",
                  "name": "Plugin Name"
                },
                "plugin": "mesosphere.marathon.plugin.http.HttpRequestHandler",
                "tags": [
                  "ui",
                  "example"
                ]
              }
            ]
          }
        });
      });

      var dispatchToken = AppDispatcher.register(function (action) {
        if (action.actionType ===
          PluginEvents.REQUEST_PLUGINS_SUCCESS) {
          AppDispatcher.unregister(dispatchToken);
          expectAsync(() => {
            expect(PluginStore.pluginsLoadingState)
              .to.equal(States.STATE_SUCCESS);
          }, done);
        }
      });

      PluginActions.requestPlugins();
    }
  );

  it("handles plugin loading failure gracefully", function (done) {
    PluginActions.load = PluginLoaderLoadStub((url, resolve, reject) => {
      reject({message: "error"});
    });

    var dispatchToken = AppDispatcher.register(function (action) {
      if (action.actionType ===
        PluginEvents.LOAD_PLUGIN_ERROR) {
        AppDispatcher.unregister(dispatchToken);
        expectAsync(() => {
          expect(PluginStore.pluginsLoadingState)
            .to.equal(States.STATE_ERROR);
        }, done);
      }
    });

    PluginActions.requestPlugins();
  });



});
