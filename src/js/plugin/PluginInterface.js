import PluginDispatcher from "./PluginDispatcher";
import PluginEventProxy from "./PluginEventProxy";

global.PluginDispatcher = PluginDispatcher;

PluginEventProxy.init();
