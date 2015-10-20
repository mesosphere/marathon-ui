var Util = require("../../helpers/Util");

var AppTypes = require("../../constants/AppTypes");
var AppStatus = require("../../constants/AppStatus");

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
  status: AppStatus.SUSPENDED,
  mem: null,
  disk: null,
  ports: [0],
  uris: [],
  user: null,
  tasks: [],
  tasksRunning: 0,
  taskStats: {},
  type: AppTypes.BASIC
};

module.exports = Util.deepFreeze(appScheme);
