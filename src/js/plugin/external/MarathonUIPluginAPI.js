import config from "../../config/config";

import PluginActions from "./PluginActions";
import PluginDispatcher from "./PluginDispatcher";
import PluginEvents from "./PluginEvents";
import PluginHelper from "./PluginHelper";
import PluginMountPoints from "./PluginMountPoints";

var MarathonUIPluginAPI = {
  PluginActions: PluginActions,
  PluginDispatcher: PluginDispatcher,
  PluginEvents: PluginEvents,
  PluginMountPoints: PluginMountPoints,
  PluginHelper: PluginHelper,
  UIVersion: config.version
};

export default MarathonUIPluginAPI;
