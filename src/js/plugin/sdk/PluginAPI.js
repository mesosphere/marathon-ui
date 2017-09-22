
import MarathonService from "./services/MarathonService";
import MarathonActions from "./actions/MarathonActions";

const version = "0.0.1";

var PluginAPI = {
  version: version,
  MarathonService: new MarathonService(),
  MarathonActions: new MarathonActions()
};

export default Object.freeze(PluginAPI);
