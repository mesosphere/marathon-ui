import Util from "../helpers/Util";

import AppStatus from "../constants/AppStatus";

export const statusNameMapping = Util.deepFreeze({
  [AppStatus.RUNNING]: "Running",
  [AppStatus.DEPLOYING]: "Deploying",
  [AppStatus.SUSPENDED]: "Suspended",
  [AppStatus.DELAYED]: "Delayed",
  [AppStatus.WAITING]: "Waiting",
  [AppStatus.WAITING_FOR_USER_ACTION]: "Waiting for user action..."
});

export const statusFilters = Object.freeze([
  AppStatus.RUNNING,
  AppStatus.DEPLOYING,
  AppStatus.SUSPENDED,
  AppStatus.DELAYED,
  AppStatus.WAITING
]);
