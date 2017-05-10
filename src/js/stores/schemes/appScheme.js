import Util from "../../helpers/Util";

import AppTypes from "../../constants/AppTypes";

const appScheme = {
  cmd: null,
  constraints: [],
  acceptedResourceRoles: [],
  container: null,
  cpus: null,
  dependencies: [],
  deployments: [],
  env: {},
  executor: "",
  healthChecks: [],
  health: [],
  healthWeight: 0,
  id: null,
  instances: 0,
  labels: {},
  lastTaskFailure: null,
  status: null,
  mem: null,
  networks: [],
  disk: null,
  portDefinitions: [],
  uris: [],
  user: null,
  tasks: [],
  tasksRunning: 0,
  taskStats: {},
  type: AppTypes.CGROUP
};

export default Util.deepFreeze(appScheme);
