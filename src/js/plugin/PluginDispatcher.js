import {Dispatcher} from "flux";

var PluginDispatcher = new Dispatcher();

global.PluginDispatcher = PluginDispatcher;

export default PluginDispatcher;
