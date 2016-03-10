import {Dispatcher} from "flux";

var PluginDispatcher = new Dispatcher();
PluginDispatcher.dispatchNext = function (obj) {
  setTimeout(function () {
    PluginDispatcher.dispatch(obj);
  });
};
export default PluginDispatcher;
