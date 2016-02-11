import Util from "../../helpers/Util";

const PluginEvents = Util.objectCreateWithAdder("PLUGIN_EVENTS_");

["STARTUP_COMPLETE", "INJECT_COMPONENT","APPS_STORE_CHANGE"]
  .forEach(PluginEvents.add);

export default PluginEvents;
