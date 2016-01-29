import AppDispatcher from "../AppDispatcher";
import JSONPUtil from "../helpers/JSONPUtil";
import PluginEvents from "../events/PluginEvents";

// Comes from the API later on
var sampleListOfPlugins = [{
  hash: "pluginHash",
  id: "examplePlugin-0.0.1",
  name: "UI Sample Plugin",
  uri: "http://localhost:4202/main.js"
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
  requestPlugin: function (pluginInfo) {
    this.request(pluginInfo.uri).then(
      function () {
        AppDispatcher.dispatch({
          actionType: PluginEvents.REQUEST_SUCCESS,
          metaInfo: pluginInfo
        });
      },
      function (error) {
        AppDispatcher.dispatch({
          actionType: PluginEvents.REQUEST_ERROR,
          data: error,
          metaInfo: pluginInfo
        });
      }
    );
  },
  request: JSONPUtil.request
};

export default PluginActions;
