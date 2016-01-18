import Util from "../helpers/Util";

import AppStatus from "../constants/AppStatus";

export const statusNameMapping = Util.deepFreeze({
  [AppStatus.RUNNING]: "Running",
  [AppStatus.DEPLOYING]: "Deploying",
  [AppStatus.SUSPENDED]: "Suspended",
  [AppStatus.DELAYED]: "Delayed",
  [AppStatus.WAITING]: "Waiting"
});
