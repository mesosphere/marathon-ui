import ajaxWrapper from "../helpers/ajaxWrapper";

import AppDispatcher from "../AppDispatcher";

import PluginEvents from "../events/PluginEvents";

import PluginDispatcher from "./PluginDispatcher";

// Comes from the API later on
var sampleListOfPlugins = [{
  hash: "pluginHash",
  name: "UI Sample Plugin",
  uri: "http://localhost:5000/plugin/example-1/main.js"
}];

var PluginActions = {
  requestMetaInfo: function () {
    AppDispatcher.dispatchNext({
      actionType: PluginEvents.META_INFO_SUCCESS,
      data: sampleListOfPlugins
    });

    /*
    AppDispatcher.dispatchNext({
      actionType: PluginEvents.META_INFO_ERROR,
      data: "Oh nooo!"
    });
    */
  },
  startPlugin: function (pluginInfo) {
    var myWorker = new Worker(pluginInfo.uri);

    /*
    Error handling missing
    */

    myWorker.postMessage({PluginDispatcher});

    AppDispatcher.dispatchNext({
      actionType: PluginEvents.REQUEST_SUCCESS,
      metaInfo: pluginInfo
    });

    /*
    this.request({
      headers: {
        "Accept": "application/javascript",
        "Content-Type": "application/javascript"
      },
      url: pluginInfo.uri
    })
      .success(function (data) {
        AppDispatcher.dispatch({
          actionType: PluginEvents.REQUEST_SUCCESS,
          data: data,
          metaInfo: pluginInfo
        });
      })
      .error(function (error) {
        AppDispatcher.dispatch({
          actionType: PluginEvents.REQUEST_ERROR,
          data: error,
          metaInfo: pluginInfo
        });
      });
    */
  },
  request: ajaxWrapper
};

export default PluginActions;
