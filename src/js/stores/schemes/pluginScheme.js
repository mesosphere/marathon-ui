import Util from "../../helpers/Util";

const pluginScheme = {
  id: null,
  modules: null,
  name: "",
  description: "",
  loaded: false
};

export default Util.deepFreeze(pluginScheme);
