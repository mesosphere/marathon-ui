import Util from "../../helpers/Util";

const PluginEvents = {
  "STARTUP_COMPLETE": "STARTUP_COMPLETE",
  "INJECT_COMPONENT": "INJECT_COMPONENT",
  "APPS_STORE_CHANGE": "APPS_STORE_CHANGE"
};

export default Util.fixObject(PluginEvents, "PLUGIN_EVENTS_");
