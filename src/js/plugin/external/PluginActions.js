import Util from "../../helpers/Util";

const PluginActions = Util.objectCreateWithAdder("PLUGIN_ACTION_");

["DIALOG_ALERT"].forEach(PluginActions.add);

export default PluginActions;
