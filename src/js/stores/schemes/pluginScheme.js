import Util from "../../helpers/Util";
import States from "../../constants/States";

const pluginScheme = {
  description: "",
  id: null,
  modules: [],
  name: "",
  state: States.STATE_INITIAL
};

export default Util.deepFreeze(pluginScheme);
