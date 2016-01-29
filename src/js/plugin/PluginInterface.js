import PluginDispatcher from "./PluginDispatcher";
import PluginEventProxy from "./PluginEventProxy";
import PluginActionProxy from "./PluginActionProxy";

global.PluginDispatcher = PluginDispatcher;

PluginEventProxy.init();
PluginActionProxy.init();
