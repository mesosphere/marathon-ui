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

  var errorResponse = {message: "error"};

  function createPlugin(id,modules) {
    var plugin =  {
      id: id || "plugin-id" ,
      implementation: "package.class",
      info: {
        description: "Plugin description.",
        name: "Plugin Name"
      },
      plugin:
        "mesosphere.marathon.plugin.http.HttpRequestHandler",
      tags: [
        "ui",
        "example"
      ]
    };

    // Add modules metadata
    if (modules != null) {
      plugin.info.modules = modules;
    }

    return plugin;
  }

  function createPluginResponse(...plugins) {
    var response = {
      body: {
        plugins: plugins
      }
    };

    return response;
  }

  beforeEach(function () {
    PluginStore.resetStore();
    PluginActions.request = ajaxWrapperStub((url, resolve, reject) => {
      switch (url) {
        case `${config.apiURL}v2/plugins`:
          resolve(createPluginResponse(createPlugin("test-plugin",["ui"])));
          break;
        default:
          reject(errorResponse);
          break;
      }
    });
    PluginActions.load = PluginLoaderLoadStub((url, resolve, reject) => {
      switch (url) {
        case `${config.apiURL}v2/plugins/test-plugin/main.js`:
          resolve("console.log(\"Example Plugin\");");
          break;
        default:
          reject(errorResponse);
          break;
      }
    });
  });

  afterEach(function () {
    PluginActions.request = ajaxWrapper;
    PluginActions.load = PluginLoader.load;
    PluginStore.resetStore();
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
      reject(errorResponse);
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
      resolve(createPluginResponse());
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
        resolve(createPluginResponse(createPlugin("missing-modules")));
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
        resolve(createPluginResponse(createPlugin("empty-modules", [])));
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

  it("ignores service only plugins in plugin request response gracefully",
    function (done) {
      PluginActions.request = ajaxWrapperStub((url, resolve) => {
        resolve(createPluginResponse(
          createPlugin("test-plugin", ["ui", "service"]),
          createPlugin("service-plugin", ["service"])
        ));
      });

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
    }
  );

  it("handles plugin loading failure gracefully", function (done) {
    PluginActions.load = PluginLoaderLoadStub((url, resolve, reject) => {
      reject(errorResponse);
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
