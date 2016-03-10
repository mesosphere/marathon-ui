import Util from "../../helpers/Util";

const PluginActions = {
  "DIALOG_ALERT": "DIALOG_ALERT",
  "FORM_INSERT": "FORM_INSERT",
  "FORM_UPDATE": "FORM_UPDATE",
  "FORM_DELETE": "FORM_DELETE"
};

export default Util.fixObject(PluginActions, "PLUGIN_ACTION_");
