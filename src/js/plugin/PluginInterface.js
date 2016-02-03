import PluginEventProxy from "./PluginEventProxy";
import PluginActionProxy from "./PluginActionProxy";
import MarathonUIPluginAPI from "./external/MarathonUIPluginAPI";

global.MarathonUIPluginAPI = MarathonUIPluginAPI;

PluginEventProxy.init();
PluginActionProxy.init();
